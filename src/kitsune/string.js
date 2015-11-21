import { createHash } from "crypto";

import { runP, getP, allP } from "kitsune/db";
import ids from "kitsune/ids";
import { getSqlQMarks, logP } from "kitsune/util";

let strTable = `t${ids.string}`;

export function put(db, str) {

	let shaHash = createHash('sha1');
	shaHash.update(str);
	var hash = shaHash.digest("hex");

	return get(db, hash)
		.then(result => {
			if(!result) {
				let query = `INSERT INTO ${strTable} VALUES (?, ?)`;
				return runP(db, query, hash, str);
			}
		})
		.then(() => hash);
}

export function get(db, id) {
	var query = `SELECT * FROM ${strTable} WHERE id = ?`;
	return getP(db, query, id)
		.then(result => (result ? result.string : undefined));
}

export function getAll(db, ...ids) {
	var qMarks = getSqlQMarks(ids.length);
	var query = `SELECT * FROM ${strTable} WHERE id IN (${qMarks})`;
	return allP(db, query, ...ids)
		.then(result => result.map((row) => row.string));
}

export default function bind(db) {
	return {
		put: put.bind(this, db),
		get: get.bind(this, db),
		getAll: getAll.bind(this, db)
	};
}
