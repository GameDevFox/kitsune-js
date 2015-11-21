#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { log } from "katana/system";

import ids from "kitsune/ids";
import bindDB from "kitsune/db";

export default function init(dbSys) {
	var { alias, create, view } = dbSys;

	// rel database
	var p = create("t"+ids.relationship, "id TEXT", "head TEXT", "tail TEXT")
			.then(alias("t"+ids.relationship, "relationship"))
			.then(alias("relationship", "rel"));

	// Add ids view
	p.then(view("ids", "SELECT id FROM rel UNION SELECT head FROM rel UNION SELECT tail FROM rel"));

	// str database
	p.then(create("t"+ids.string, "id TEXT", "string TEXT").catch(console.error))
		.then(alias("t"+ids.string, "string"));

	return p.catch(console.error);

	// TODO: The new equivalent of these
	// echo "INSERT INTO core VALUES (\"$id\", \"$name\");"
	// echo "INSERT INTO t${nodeId} VALUES (\"$id\", \"${tableId}\");" # "node" table
	// echo "INSERT INTO t${tableId} VALUES (\"$id\");"; # "table" table
}

// istanbul ignore if
if(!module.parent) {
	var dbFile = process.argv[2];
	if(!dbFile)
		throw new Error("Please specify database file");

	var sqliteDB = new sqlite3.Database(dbFile);

	let dbSys = bindDB(sqliteDB);
	init(dbSys);
}
