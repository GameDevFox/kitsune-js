#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { ids, tables } from "./index";
import buildBase from "./base";

export function init() {

	var revLookup = {};
	_.each(tables, function(key, value) {
		revLookup[value] = key;
	});

	var sqliteDB = new sqlite3.Database("data/data.db");
	var base = buildBase(sqliteDB);

	var createTable = base.createTable;

	createTable("core", "id TEXT", "name TEXT")
		.then(createTable(ids.node, "id TEXT PRIMARY KEY", "type TEXT"))
		.then(createTable(ids.table, "id TEXT"))
		.then(createTable(ids.relationship, "id TEXT", "head TEXT", "tail TEXT", "type TEXT"))
		.then(createTable(ids.string, "id TEXT", "string TEXT"));
}

init();
