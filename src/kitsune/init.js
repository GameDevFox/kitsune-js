#!/usr/bin/env node
import sqlite3 from "sqlite3";

var db = new sqlite3.Database("data/data.db");

export function createTable(name, ...cols) {
	return new Promise(function(resolve, reject) {
		var query = "CREATE TABLE " + name + "(";
		query += cols.join(", ");
		query += ");";
		log.query(query);
		db.run(query, function(err) {
			if(err)
				reject(err);

			resolve(name);
		});
	});
}

export function init() {
	createTable(core, "id TEXT", "name TEXT")
		.then(createTable(core.node, "is TEXT PRIMARY KEY", "type TEXT"));
}
