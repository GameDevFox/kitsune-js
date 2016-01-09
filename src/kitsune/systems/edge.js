import _ from "lodash";

import { runP, getP, allP } from "kitsune/systems/db";
import { qMarks, whereClause } from "kitsune/systems/db/util";
import ids from "kitsune/ids";
import * as util from "kitsune/util";

let edgeTable = `t${ids.edge}`;

// Module functions
export function search(db, criteria) {
	let query = `SELECT * FROM ${edgeTable}`;

	let { sql: whereClause, args } = whereClause(criteria);
	query += whereClause;

	return allP(db, query, args);
}

export function get(db, id) {
	let query = `SELECT * FROM ${edgeTable} WHERE id = ?;`;
	return getP(db, query, id);
}

export function getMany(db, ...ids) {
	ids = _.flatten(ids);
	let query = `SELECT * FROM ${edgeTable} WHERE id IN (${qMarks(ids)});`;
	return allP(db, query, ids);
}

// TODO: Make is possible to add an arbritrary about of edges in the form of:
// - one head, many tails
// - many heads, one tail
// - many head tail pairs
// NOTE: These should all be executed with one call

// TODO: rename to add/create/put (to standardize api)
export function relate(db, head, ...tails) {
	if(tails.length > 1) {
		let promises = _.map(tails, thisTail => {
			return relate(db, head, thisTail);
		});
		return Promise.all(promises);
	}

	let id = util.createId();
	let tail = tails[0];

	// TODO: Update this so that it passes all values in one query
	let query = `INSERT INTO ${edgeTable} (id, head, tail) VALUES (?, ?, ?)`;

	// TODO: And exception is SOMETIMES thrown here, we need to figure this out
	return runP(db, query, [id, head, tail])
		.then(() => id);
}

export function del(db, ...ids) {
	let query = `DELETE FROM ${edgeTable} WHERE id IN (${qMarks(ids)});`;
	return runP(db, query, ids);
}

// TODO: Condidate for node module
export function getTails(db, head) {
	let query = `SELECT tail FROM ${edgeTable} WHERE head = ?;`;
	return allP(db, query, head)
		.then(tails => _.map(tails, "tail"));
}

// TODO: Candidate for node module
export function getHeads(db, tail) {
	let query = `SELECT head FROM ${edgeTable} WHERE tail = ?;`;
	return allP(db, query, tail)
		.then(heads => _.map(heads, "head"));
}

// TODO: Condidate for dict module ???
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

// TODO: Candidate for dict module
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
