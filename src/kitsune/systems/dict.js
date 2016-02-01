import _ from "lodash";

import ids from "kitsune/ids";

let edgeTable = `t${ids.edge}`;

// TODO: Allow multiple values
export function put(edgeSys, node, key, value) {
	let edge;
	return edgeSys.create(node, value)
		.then(edgeId => {
			edge = edgeId;
			return edgeSys.create(key, edge);
		})
		.then(edgeId => {
			return {
				id: edge,
				head: node,
				tail: value
			};
		});
}

// TODO: This query may return nodes that aren't edge nodes
let edgeTypeQuery = `SELECT tail FROM ${edgeTable} WHERE head = ?`;

export function get(dbSys, node, key) {
	let query = `SELECT tail FROM ${edgeTable} WHERE id IN (${edgeTypeQuery}) AND head = ?`;
	return dbSys.allP(query, [key, node])
		.then(tails => _.map(tails, "tail"));
}

// TODO: Find a better name for this
export function getHead(dbSys, value, key) {
	let query = `SELECT head FROM ${edgeTable} WHERE id IN (${edgeTypeQuery}) AND tail = ?`;
	return dbSys.allP(query, [key, value])
		.then(heads => _.map(heads, "head"));
}

export default function bind(dbSys, edgeSys) {
	return {
		put: put.bind(this, edgeSys),
		get: get.bind(this, dbSys), // getValue(node, key)

		// TODO: Implement "getKey(node, value)"
		// getKey(node, value)
		getHead: getHead.bind(this, dbSys)
	};
}
