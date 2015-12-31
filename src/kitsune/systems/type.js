import _ from "lodash";

import { getP } from "kitsune/systems/db";

let types = ["edge", "point", "tail", "head", "string"];

var queryParts = _.map(types, (type) => `id IN (SELECT id FROM ${type}) as ${type}`).join(", ");
let query = `SELECT ${queryParts} FROM node WHERE id = ?`;

export function getTypes(db, id) {
	return getP(db, query, [id])
		.then((result) => _(result)
			  .map((value, key) => value ? key : undefined)
			  .filter((value) => value)
			  .value()
			 );
}

export default function bind(db) {
	return {
		getTypes: getTypes.bind(this, db)
	};
}