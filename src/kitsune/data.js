import _ from "lodash";

import { buildQuery, queryBuilder as q } from "kitsune/systems/db/util";

// TODO: Make columns ids as well
// ... then use these ids in the services (like "edge.js")
export let ids = {
	// types
	type: "86124d0bb2f607e8c369f92987b71e8f46f720b5", //
		table: "9f568ad4ed64b326d24f672d0ea046e0db8bc3b7", //
		query: "46db53f47941dcfce69b57b81fac0312c242b93d", //

	// tables
	edge: "ca0768dab03eb0523568e066f333a7d82e75cf27", //
	string: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04", //

	// entities
	node: "9994a48a790d9c9c619853b9baff8ab36eace365",
	point: "479fec66cd9ebd2f7f73c702580ceb0c90712e79",
	head: "0f51ed71c5fbae5998482f73f61f207ff57bd980",
	tail: "67dc0a2e7f8562343efa43cbcae67f04a001af36",

	// properties
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", //

	// chain
	chain: "f6dca3a59be505e556331717fc119e6c1adfbf90",
};

let edgeTable = "t"+ids.edge;

export let typeQs = {
	// Type queries (return list of ids)
	edge: `SELECT id FROM ${edgeTable} WHERE id IS NOT NULL`,
	head: `SELECT DISTINCT head AS id FROM ${edgeTable} WHERE head IS NOT NULL`,
	tail: `SELECT DISTINCT tail AS id FROM ${edgeTable} WHERE tail IS NOT NULL`,
};

export let opQs = {
	// Node op queries (takes a list and returns a list)
	tails: 'SELECT tail AS id FROM '+edgeTable+' WHERE head IN (${nodes})',
	heads: 'SELECT head AS id FROM '+edgeTable+' WHERE tail IN (${nodes})',
	tailEdges: 'SELECT id FROM '+edgeTable+' WHERE head IN (${nodes})',
	headEdges: 'SELECT id FROM '+edgeTable+' WHERE tail IN (${nodes})',

	// Edge op queries
	tailEnd: 'SELECT tail AS id FROM '+edgeTable+' WHERE id IN (${nodes})',
	headEnd: 'SELECT head AS id FROM '+edgeTable+' WHERE id IN (${nodes})',

	selectType: 'SELECT id FROM (${nodes}) WHERE id IN (${type})',
};

export let queries = _.extend(typeQs, opQs);

// TODO: Find some better way to do this
let { tails, headEnd } = opQs;
let nameQ = q(`'${ids.name}'`).op(tails).op(headEnd);
let nameSql = buildQuery(nameQ).query;

