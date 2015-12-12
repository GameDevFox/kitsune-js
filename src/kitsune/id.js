import _ from "lodash";

import { runP, getP, allP } from "kitsune/db";
import { views } from "kitsune/ids";

let idTable = `t${views.id.id}`;
let headTable = `t${views.head.id}`;
let tailTable = `t${views.tail.id}`;

export function all(db) {
	return listIdTable(db, views.id.id);
}
export function heads(db) {
	return listIdTable(db, views.head.id);
}
export function tails(db) {
	return listIdTable(db, views.tail.id);
}

function listIdTable(db, tableId) {
	let query = `SELECT id FROM t${tableId}`;
	return allP(db, query)
		.then(results => _.map(results, result => result["id"]));
}

export default function bind(db) {
	return {
		all: all.bind(this, db),
		heads: heads.bind(this, db),
		tails: tails.bind(this, db)
	};
}