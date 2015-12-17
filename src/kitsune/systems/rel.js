import _ from "lodash";

import { runP, getP, allP } from "kitsune/systems/db";
import * as dbUtil from "kitsune/systems/db/util";
import ids from "kitsune/ids";
import * as util from "kitsune/util";

let relTable = `t${ids.relationship}`;

// Module functions
export function search(db, criteria) {
	let query = `SELECT * FROM ${relTable}`;

	let { sql: whereClause, args } = dbUtil.whereClause(criteria);
	query += whereClause;

	return allP(db, query, args);
}

export function get(db, id) {
	let query = `SELECT * FROM ${relTable} WHERE id = ?;`;
	return getP(db, query, id);
}

export function getMany(db, ...ids) {
	ids = _.flatten(ids);
	let qMarks = util.getSqlQMarks(ids.length);
	let query = `SELECT * FROM ${relTable} WHERE id IN (${qMarks});`;
	return allP(db, query, ids);
}

export function relate(db, head, ...tails) {

	if(tails.length > 1) {
		let promises = _.map(tails, thisTail => {
			return relate(db, head, thisTail);
		});
		return Promise.all(promises);
	}

	let id = util.createId();
	let tail = tails[0];

	let query = `INSERT INTO ${relTable} (id, head, tail) VALUES (?, ?, ?)`;
	return runP(db, query, [id, head, tail])
		.then(() => id);
}

export function del(db, ...ids) {
	let qMarks = util.getSqlQMarks(ids.length);
	let query = `DELETE FROM ${relTable} WHERE id IN (${qMarks});`;
	return runP(db, query, ids);
}

export function getTails(db, head) {
	let query = `SELECT tail FROM ${relTable} WHERE head = ?;`;
	return allP(db, query, head)
		.then(tails => _.map(tails, "tail"));
}

export function getHeads(db, tail) {
	let query = `SELECT head FROM ${relTable} WHERE tail = ?;`;
	return allP(db, query, tail)
		.then(heads => _.map(heads, "head"));
}

function assign(db, relType, head, tail) {
	let first;
	return relate(db, head, tail)
		.then(relId => {
			first = relId;
			return relate(db, relType, relId);
		})
		.then(relId => {
			return {
				id: relId,
				head: relType,
				tail: first
			};
		});
}

// TODO: This query may return nodes that aren't rel nodes
let relTypeQuery = `SELECT tail FROM ${relTable} WHERE head = ?`;

function findByTail(db, relType, tail) {
	let query = `SELECT head FROM ${relTable} WHERE id IN (${relTypeQuery}) AND tail = ?`;
	return allP(db, query, [relType, tail])
		.then(heads => _.map(heads, "head"));
}

function findByHead(db, relType, head) {
	let query = `SELECT tail FROM ${relTable} WHERE id IN (${relTypeQuery}) AND head = ?`;
	return allP(db, query, [relType, head])
		.then(tails => _.map(tails, "tail"));
}

// default export
export default function bind(db) {
	return {
		search: search.bind(this, db), // GET
		get: get.bind(this, db), // GET /:id
		getMany: getMany.bind(this, db),

		relate: relate.bind(this, db),

		getTails: getTails.bind(this, db),
		getHeads: getHeads.bind(this, db),

		assign: assign.bind(this, db),
		findByTail: findByTail.bind(this, db),
		findByHead: findByHead.bind(this, db),

		del: del.bind(this, db) // DELETE /:id
	};
}
