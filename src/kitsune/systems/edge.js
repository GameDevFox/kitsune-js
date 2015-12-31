import _ from "lodash";

import { runP, getP, allP } from "kitsune/systems/db";
import * as dbUtil from "kitsune/systems/db/util";
import ids from "kitsune/ids";
import * as util from "kitsune/util";

let edgeTable = `t${ids.edge}`;

// Module functions
export function search(db, criteria) {
	let query = `SELECT * FROM ${edgeTable}`;

	let { sql: whereClause, args } = dbUtil.whereClause(criteria);
	query += whereClause;

	return allP(db, query, args);
}

export function get(db, id) {
	let query = `SELECT * FROM ${edgeTable} WHERE id = ?;`;
	return getP(db, query, id);
}

export function getMany(db, ...ids) {
	ids = _.flatten(ids);
	let qMarks = util.getSqlQMarks(ids.length);
	let query = `SELECT * FROM ${edgeTable} WHERE id IN (${qMarks});`;
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

	let query = `INSERT INTO ${edgeTable} (id, head, tail) VALUES (?, ?, ?)`;
	return runP(db, query, [id, head, tail])
		.then(() => id);
}

export function del(db, ...ids) {
	let qMarks = util.getSqlQMarks(ids.length);
	let query = `DELETE FROM ${edgeTable} WHERE id IN (${qMarks});`;
	return runP(db, query, ids);
}

export function getTails(db, head) {
	let query = `SELECT tail FROM ${edgeTable} WHERE head = ?;`;
	return allP(db, query, head)
		.then(tails => _.map(tails, "tail"));
}

export function getHeads(db, tail) {
	let query = `SELECT head FROM ${edgeTable} WHERE tail = ?;`;
	return allP(db, query, tail)
		.then(heads => _.map(heads, "head"));
}

function assign(db, edgeType, head, tail) {
	let first;
	return relate(db, head, tail)
		.then(edgeId => {
			first = edgeId;
			return relate(db, edgeType, edgeId);
		})
		.then(edgeId => {
			return {
				id: edgeId,
				head: edgeType,
				tail: first
			};
		});
}

// TODO: This query may return nodes that aren't edge nodes
let edgeTypeQuery = `SELECT tail FROM ${edgeTable} WHERE head = ?`;

function findByTail(db, edgeType, tail) {
	let query = `SELECT head FROM ${edgeTable} WHERE id IN (${edgeTypeQuery}) AND tail = ?`;
	return allP(db, query, [edgeType, tail])
		.then(heads => _.map(heads, "head"));
}

function findByHead(db, edgeType, head) {
	let query = `SELECT tail FROM ${edgeTable} WHERE id IN (${edgeTypeQuery}) AND head = ?`;
	return allP(db, query, [edgeType, head])
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
