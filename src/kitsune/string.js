import { createHash } from "crypto";

import { runP, getP } from "kitsune/db";
import ids from "kitsune/ids";

let strTable = `t${ids.string}`;

export function create(db, str) {
	let shaHash = createHash('sha1');
	shaHash.update(str);
	var hash = shaHash.digest("hex");

	let query = `INSERT INTO ${strTable} VALUES (?, ?)`;
	return runP(db, query, hash, str)
		.then(() =>  hash);
}

export function get(db, id) {
	var query = `SELECT * FROM ${strTable} WHERE id = ?`;
	return getP(db, query, id)
		.then(result => result.string);
}

export default function bind(db) {
	return {
		create: create.bind(this, db),
		get: get.bind(this, db)
	};
}
