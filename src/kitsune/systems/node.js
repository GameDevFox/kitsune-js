import _ from "lodash";

import { runP, getP, allP } from "kitsune/systems/db";
import ids from "kitsune/ids";

export function all(db) {
	return listIdTable(db, ids.id);
}
export function points(db) {
	return listIdTable(db, ids.point);
}
export function heads(db) {
	return listIdTable(db, ids.head);
}
export function tails(db) {
	return listIdTable(db, ids.tail);
}

function listIdTable(db, tableId) {
	let query = `SELECT id FROM t${tableId}`;
	return allP(db, query)
		.then(results => _.map(results, result => result.id));
}

export default function bind(db) {
	return {
		all: all.bind(this, db),
		points: points.bind(this, db),
		heads: heads.bind(this, db),
		tails: tails.bind(this, db)
	};
}