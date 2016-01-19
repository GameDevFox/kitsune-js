import { createHash } from "crypto";

import { runP, getP, allP } from "kitsune/systems/db";
import ids from "kitsune/ids";
import { logP } from "kitsune/util";
import { qMarks } from "kitsune/systems/db/util";

let strTable = `t${ids.string}`;

export function search(db, criteria) {
	let query = `SELECT * FROM ${strTable}`;

	// TODO: Extract some query where builder
	let wheres = [];
	let args = [];

	if(criteria.id) {
		wheres.push("id = $id");
		args.push(criteria.id);
	}
	if(criteria.string) {
		wheres.push("string = $string");
		args.push(criteria.string);
	}

	if(wheres.length) {
		query += " WHERE";
		for(let i=0; i<wheres.length; i++) {
			if(i)
				query += " AND";

			let where = wheres[i];
			query += " " + where;
		}
	}

	return allP(db, query, args);
}

export function put(db, str) {

	let shaHash = createHash('sha1');
	shaHash.update(str);
	var hash = shaHash.digest("hex");

	return get(db, hash)
		.then(result => {
			if(!result) {
				let query = `INSERT INTO ${strTable} VALUES (?, ?)`;
				return runP(db, query, [hash, str]);
			}
		})
		.then(() => hash);
}

export function get(db, id) {
	var query = `SELECT * FROM ${strTable} WHERE id = ?`;
	return getP(db, query, id)
		.then(result => (result ? result.string : undefined));
}

export function getMany(db, ...ids) {
	var query = `SELECT * FROM ${strTable} WHERE id IN (${qMarks(ids)})`;
	return allP(db, query, ids)
		.then(result => result.map((row) => row.string));
}

export function del(db, ...ids) {
	var query = `DELETE FROM ${strTable} WHERE id IN (${qMarks(ids)})`;
	return runP(db, query, ids);
}

export default function bind(db) {
	return {
		search: search.bind(this, db), // GET
		get: get.bind(this, db), // GET /:id
		getMany: getMany.bind(this, db),

		put: put.bind(this, db), // POST

		del: del.bind(this, db) // DELETE /:id
	};
}
