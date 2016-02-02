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
let keyQuery = `SELECT tail FROM ${edgeTable} WHERE head = ?`;

export function get(dbSys, node, key) {
	let query = `SELECT tail AS id FROM ${edgeTable} WHERE id IN (${keyQuery}) AND head = ?`;
	return dbSys.allP(query, [key, node])
		.then(ids => _.map(ids, "id"));
}

export function getKey(dbSys, node, value) {
	let edgeQuery = `SELECT id FROM ${edgeTable} WHERE head = ? AND tail = ?`;
	let query = `SELECT head AS id FROM ${edgeTable} WHERE tail IN (${edgeQuery})`;
	return dbSys.allP(query, [node, value])
		.then(ids => _.map(ids, "id"));
}

export function getHead(dbSys, value, key) {
	let query = `SELECT head AS id FROM ${edgeTable} WHERE id IN (${keyQuery}) AND tail = ?`;
	return dbSys.allP(query, [key, value])
		.then(ids => _.map(ids, "id"));
}

export default function bind({ dbSys, edgeSys }) {
	return {
		put: put.bind(this, edgeSys),
		get: get.bind(this, dbSys), // getValue(node, key)

		getKey: getKey.bind(this, dbSys),
		getHead: getHead.bind(this, dbSys)
	};
}
