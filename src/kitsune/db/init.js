#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { log } from "katana/system";
import { ids, tables } from "./index";
import base from "./base";

export default function init(sqliteDB) {
	var { create, alias } = base(sqliteDB);

	sqliteDB.serialize(function() {
		console.log(ids.relationship);
		create("t"+ids.relationship, "id TEXT", "head TEXT", "tail TEXT").catch(console.error);
		alias("t"+ids.relationship, "relationship").catch(console.error);
		alias("relationship", "rel").catch(console.error);

		// Add ids view
		alias("ids", "SELECT id FROM rel UNION SELECT head FROM rel UNION SELECT tail FROM rel");

		// TODO:
		// echo "INSERT INTO core VALUES (\"$id\", \"$name\");"
		// echo "INSERT INTO t${nodeId} VALUES (\"$id\", \"${tableId}\");" # "node" table
		// echo "INSERT INTO t${tableId} VALUES (\"$id\");"; # "table" table
	});
}

if(!module.parent) {
	var dbFile = process.argv[2];
	if(!dbFile)
		throw new Error("Please specify database file");

	var sqliteDB = new sqlite3.Database(dbFile);
	init(sqliteDB);
}
