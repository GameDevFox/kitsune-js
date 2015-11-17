import _ from "lodash";

import * as util from "./util";

// Load core ids
export var tables = {
	relationship: "ca0768dab03eb0523568e066f333a7d82e75cf27",
};

export var ids = _.extend({
	// relationship ids
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0",
	string: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04"
}, tables);

var relTable = `t${tables.relationship}`;

// Module functions
export function relate(db, head, ...tails) {

	if(tails.length > 1) {
		var promises = _.map(tails, (thisTail) => {
			return relate(db, head, thisTail);
		});
		return Promise.all(promises);
	}

	var id = util.createId();
	var tail = tails[0];

	var query = `INSERT INTO ${relTable} (id, head, tail) VALUES (?, ?, ?)`;
	return runP(db, query, id, head, tail)
		.then(() => id);
}

export function getRel(db, id) {
	var query = `SELECT * FROM ${relTable} WHERE id = ?;`;
	return getP(db, query, id);
}

export function getRels(db, ...ids) {
	ids = _.flatten(ids);
	var qMarks = util.getSqlQMarks(ids.length);
	var query = `SELECT * FROM ${relTable} WHERE id IN (${qMarks});`;
	return allP(db, query, ...ids);
}

export function getTails(db, head) {
	var query = `SELECT tail FROM ${relTable} WHERE head = ?;`;
	return allP(db, query, head)
		.then((tails) => _.map(tails, "tail"));
}

export function getHeads(db, tail) {
	var query = `SELECT head FROM ${relTable} WHERE tail = ?;`;
	return allP(db, query, tail)
		.then((heads) => _.map(heads, "head"));
}

export function name(db, id, nameId) {
	var first;
	return relate(db, id, nameId)
		.then((relId) => {
			first = relId;
			return relate(db, ids.name, relId);
		})
		.then((relId) => {
			return {
				id: relId,
				head: ids.name,
				tail: first
			};
		});
}

export function findByName(db, nameId) {
	var nameRelQuery = `SELECT tail FROM ${relTable} WHERE head = ?`;
	var query = `SELECT head FROM ${relTable} WHERE id IN (${nameRelQuery}) AND tail = ?`;
	return allP(db, query, ids.name, nameId)
		.then((heads) => _.map(heads, "head"));
}

// helper functions
function dbOpTemplate(opName, db, query, ...args) {
	return new Promise((resolve, reject) => {
		db[opName](query, args, (err, result) => {
			if(err)
				reject(err);

			if(result)
				resolve(result);
			else
				resolve();
		});
	});
}

function callLoop(fn, ...tail) {
}

var runP = dbOpTemplate.bind(this, "run");
var getP = dbOpTemplate.bind(this, "get");
var allP = dbOpTemplate.bind(this, "all");

// default export
export default function buildDB(db) {
	return {
		relate: relate.bind(this, db),
		getRel: getRel.bind(this, db),
		getRels: getRels.bind(this, db),
		getTails: getTails.bind(this, db),
		getHeads: getHeads.bind(this, db),
		name: name.bind(this, db),
		findByName: findByName.bind(this, db)
	};
}
