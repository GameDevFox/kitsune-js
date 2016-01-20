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

// TODO: Do I need "get" and "getMany", we should only have "getMany"
// and use it to get one edge
export function get(db, id) {
	let query = `SELECT * FROM ${edgeTable} WHERE id = ?;`;
	return getP(db, query, id);
}

export function getMany(db, ...ids) {
	ids = _.flatten(ids);
	let query = `SELECT * FROM ${edgeTable} WHERE id IN (${qMarks(ids)});`;
	return allP(db, query, ids);
}

export function create(db, heads, tails) {

	let edgePairs;
	if(!tails) {
		// Many
		edgePairs = heads;
	} else if(!_.isArray(heads) && !_.isArray(tails)) {
		// One to one
		edgePairs = [[heads, tails]];
	} else if(!_.isArray(heads) && _.isArray(tails)) {
		// One to many
		edgePairs = _.map(tails, (tail) => [heads, tail]);
	} else if(_.isArray(heads) && !_.isArray(tails)) {
		// Many to one
		edgePairs = _.map(heads, head => [head, tails]);
	} else {
		throw new Error("Invalid arguments");
	}

	let queryArgs = [];
	let edges = _.each(edgePairs, edgePair => {
		var edgeId = util.createId();
		edgePair.splice(0, 0, edgeId);

		queryArgs.push("(?, ?, ?)");
	});
	let args = _.flattenDeep(edges);

	let queryArgsStr = queryArgs.join(", ");
	let query = `INSERT INTO ${edgeTable} (id, head, tail) VALUES ${queryArgsStr}`;

	let result = _.map(edges, edge => edge[0]);

	// TODO: And exception is SOMETIMES thrown here, we need to figure this out
	return runP(db, query, args)
		.then(() => result);
}

export function del(db, ...ids) {
	let query = `DELETE FROM ${edgeTable} WHERE id IN (${qMarks(ids)});`;
	return runP(db, query, ids);
}

// QUERIES

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

// TODO: This query may return nodes that aren't edge nodes
let edgeTypeQuery = `SELECT tail FROM ${edgeTable} WHERE head = ?`;

// TODO: Candidate for dict module
export function findByTail(db, edgeType, tail) {
	let query = `SELECT head FROM ${edgeTable} WHERE id IN (${edgeTypeQuery}) AND tail = ?`;
	return allP(db, query, [edgeType, tail])
		.then(heads => _.map(heads, "head"));
}

export function findByHead(db, edgeType, head) {
	let query = `SELECT tail FROM ${edgeTable} WHERE id IN (${edgeTypeQuery}) AND head = ?`;
	return allP(db, query, [edgeType, head])
		.then(tails => _.map(tails, "tail"));
}

// default export
export default function bind(db) {
	return {
		search: search.bind(this, db), // GET
		get: get.bind(this, db), // GET /:id
		getMany: getMany.bind(this, db), // GET (multi)

		create: create.bind(this, db), // CREATE
		del: del.bind(this, db), // DELETE /:id

		getTails: getTails.bind(this, db),
		getHeads: getHeads.bind(this, db),

		findByTail: findByTail.bind(this, db),
		findByHead: findByHead.bind(this, db)

	};
}
