// TODO: Make columns ids as well
// ... then use these ids in the services (like "rel.js")
export let ids = {
	type: "86124d0bb2f607e8c369f92987b71e8f46f720b5", //
		table: "9f568ad4ed64b326d24f672d0ea046e0db8bc3b7", //
		query: "46db53f47941dcfce69b57b81fac0312c242b93d", //

	// tables
	relationship: "ca0768dab03eb0523568e066f333a7d82e75cf27", //
	string: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04", //

	id: "9994a48a790d9c9c619853b9baff8ab36eace365",
	point: "479fec66cd9ebd2f7f73c702580ceb0c90712e79",
	head: "0f51ed71c5fbae5998482f73f61f207ff57bd980",
	tail: "67dc0a2e7f8562343efa43cbcae67f04a001af36",

	// properties
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", //

	// description: "4b8d5a08dc648d9f1aa7c8208ecca1a93f18a8f7",
	// classifier: "e18591bab26442f44693abed553350b1e50b2081",
	// view: "2d96db1064077326fe67700330fbb32c8e4b9060",
	// is: "bc1169765ce4e2d03e224ac040e15d89189369bb",
};

export let tables = {
	relationship: {
		id: ids.relationship,
		columns: ["id TEXT", "head TEXT", "tail TEXT"]
	},
	string: {
		id: ids.string,
		columns: ["id TEXT", "string TEXT"]
	}
};

export let aliases = {
	rel: "relationship"
};

let edgeTable = "t"+ids.relationship;

export let queries = {
	// Type queries (return list of ids)
	edge: `SELECT id FROM ${edgeTable} WHERE id IS NOT NULL`,
	head: `SELECT DISTINCT head AS id FROM ${edgeTable} WHERE head IS NOT NULL`,
	tail: `SELECT DISTINCT tail AS id FROM ${edgeTable} WHERE tail IS NOT NULL`,

	// Op queries (takes a list and returns a list)
	tails: `SELECT tail AS id FROM ${edgeTable} WHERE head IN ?`,
	heads: `SELECT head AS id FROM ${edgeTable} WHERE tail IN ?`,
	tailEdges: `SELECT id FROM ${edgeTable} WHERE head IN ?`,
	headEdges: `SELECT id FROM ${edgeTable} WHERE tail IN ?`
};

export let views = {
	id: {
		id: ids.id,
		query: `SELECT DISTINCT id FROM (${queries.edge} UNION ${queries.head} UNION ${queries.tail})`
	},
	point: {
		id: ids.point,
		query: `SELECT DISTINCT id FROM id WHERE id NOT IN (SELECT id FROM ${edgeTable})`
	},
	head: {
		id: ids.head,
		query: queries.head
	},
	tail: {
		id: ids.tail,
		query: queries.tail
	},
	name: {
		id: ids.name,
		query: `SELECT head FROM ${edgeTable} WHERE id IN (SELECT tail FROM ${edgeTable} WHERE head = '${ids.name})'`
	}
};

export default ids;