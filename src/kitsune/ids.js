// TODO: Make columns ids as well
// ... then use these ids in the services (like "rel.js")
export let tables = {
	relationship: {
		id: "ca0768dab03eb0523568e066f333a7d82e75cf27",
		columns: ["id TEXT", "head TEXT", "tail TEXT"]
	},
	string: {
		id: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04",
		columns: ["id TEXT", "string TEXT"]
	}
};

export let aliases = {
	rel: "relationship"
};

let relTable = "t"+tables.relationship.id;
export let views = {
	id: {
		id: "9994a48a790d9c9c619853b9baff8ab36eace365",
		query: `SELECT DISTINCT id FROM (` +
			`SELECT id FROM ${relTable} WHERE id IS NOT NULL ` +
			`UNION SELECT head FROM ${relTable} WHERE head IS NOT NULL ` +
			`UNION SELECT tail FROM ${relTable} WHERE tail IS NOT NULL)`
	},
	head: {
		id: "0f51ed71c5fbae5998482f73f61f207ff57bd980",
		query: `SELECT DISTINCT head AS id FROM ${relTable} WHERE head IS NOT NULL`
	},
	tail: {
		id: "67dc0a2e7f8562343efa43cbcae67f04a001af36",
		query: `SELECT DISTINCT tail AS id FROM ${relTable} WHERE tail IS NOT NULL`
	}
};

export default {
	// core
	type: "86124d0bb2f607e8c369f92987b71e8f46f720b5",

	// tables
	relationship: tables.relationship.id,
	string: tables.string.id,

	// views
	id: views.id.id,

	// "properties"
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0",
	// description: "4b8d5a08dc648d9f1aa7c8208ecca1a93f18a8f7",

	// classifier: "e18591bab26442f44693abed553350b1e50b2081",
	// query: "46db53f47941dcfce69b57b81fac0312c242b93d"
};