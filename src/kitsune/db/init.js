#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { log } from "katana/system";
import { ids, tables } from "./index";
import buildBase from "./base";

export function init(dbFileName) {

	var sqliteDB = new sqlite3.Database(dbFileName);
	var base = buildBase(sqliteDB);

	var create = base.create;
	var alias = base.alias;

	sqliteDB.serialize(function() {
		create("core", "id TEXT", "name TEXT");
		create("t"+ids.node, "id TEXT PRIMARY KEY", "type TEXT");
		create("t"+ids.table, "id TEXT");
		create("t"+ids.relationship, "id TEXT", "head TEXT", "tail TEXT", "type TEXT");
		create("t"+ids.string, "id TEXT", "string TEXT");

		_.each(tables, function(table, tableName) {
			alias(table, tableName).catch(log);

			// TODO:
			// echo "INSERT INTO core VALUES (\"$id\", \"$name\");"
			// echo "INSERT INTO t${nodeId} VALUES (\"$id\", \"${tableId}\");" # "node" table
			// echo "INSERT INTO t${tableId} VALUES (\"$id\");"; # "table" table
		});
	});
}

var dbFile = process.argv[2];
dbFile = dbFile ? dbFile : "data/data.db";

init(dbFile);
