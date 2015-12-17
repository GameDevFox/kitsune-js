import sqlite3 from "sqlite3";

import init from "kitsune/systems/db/init";

var dbs = {};

export default function getDB(path) {

	path = path ? path : process.env.KITSUNE_DB_PATH;
	path = path ? path : ":memory:";

	if(dbs[path])
		return dbs[path];

	var database = new sqlite3.Database(path);
	database.initP = init(database);

	dbs[path] = database;
	return database;
}
