import _ from "lodash";

import { runP, getP, allP } from "kitsune/db";
import ids from "kitsune/ids";
import * as util from "kitsune/util";

let relTable = `t${ids.relationship}`;

// Module functions
export function getRel(db, id) {
	let query = `SELECT * FROM ${relTable} WHERE id = ?;`;
	return getP(db, query, id);
}

export function getRels(db, ...ids) {
	ids = _.flatten(ids);
	let qMarks = util.getSqlQMarks(ids.length);
	let query = `SELECT * FROM ${relTable} WHERE id IN (${qMarks});`;
	return allP(db, query, ...ids);
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
	return runP(db, query, id, head, tail)
		.then(() => id);
}

export function del(db, ...ids) {
	let qMarks = util.getSqlQMarks(ids.length);
	let query = `DELETE FROM ${relTable} WHERE id IN (${qMarks});`;
	return runP(db, query, [ids]);
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

export function name(db, id, nameId) {
	return assign(db, ids.name, id, nameId);
}

export function findByName(db, nameId) {
	return findByTail(db, ids.name, nameId);
}

export function getNames(db, id) {
	return findByHead(db, ids.name, id);
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
	return allP(db, query, relType, tail)
		.then(heads => _.map(heads, "head"));
}

function findByHead(db, relType, head) {
	let query = `SELECT tail FROM ${relTable} WHERE id IN (${relTypeQuery}) AND head = ?`;
	return allP(db, query, relType, head)
		.then(tails => _.map(tails, "tail"));
}

// default export
export default function bind(db) {
	return {
		relate: relate.bind(this, db),
		getRel: getRel.bind(this, db),
		getRels: getRels.bind(this, db),
		del: del.bind(this, db),

		getTails: getTails.bind(this, db),
		getHeads: getHeads.bind(this, db),

		name: name.bind(this, db),
		findByName: findByName.bind(this, db),
		getNames: getNames.bind(this, db)
	};
}
