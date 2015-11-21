#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { noop } from "katana/func";
import { log } from "katana/system";

import ids from "kitsune/ids";
import bindDB from "kitsune/db";
import bindRelSys from "kitsune/rel";
import bindStrSys from "kitsune/string";
import buildNameSys from "kitsune/name";
import { logP } from "kitsune/util";

export default function initDB(sqliteDB) {
	var systems = buildSystems(sqliteDB);
	return init(systems);
}

export function init({ dbSys: dbSys, nameSys: nameSys }) {
	var { alias, create, view } = dbSys;

	// rel database
	return create("t"+ids.relationship, "id TEXT", "head TEXT", "tail TEXT")
		.then(alias("t"+ids.relationship, "relationship"))
		.then(alias("relationship", "rel"))
		// Add ids view
		.then(view("ids", "SELECT id FROM rel UNION SELECT head FROM rel UNION SELECT tail FROM rel"))
		// str database
		.then(create("t"+ids.string, "id TEXT", "string TEXT").catch(console.error))
		.then(alias("t"+ids.string, "string"))
		.then(() => populate(nameSys))
		.then(noop)
		.catch(console.error);
}

export function populate(nameSys) {
	var promises = _.map(ids, (value, name) => {
		return nameSys.name(value, name)
			.then(() => {
				return nameSys.getNames(value);
			})
			.then(names => logP("names: "));
	});
	return Promise.all(promises);
}

export function buildSystems(sqliteDB) {

	let relSys = bindRelSys(sqliteDB);
	let stringSys = bindStrSys(sqliteDB);

	return {
		dbSys: bindDB(sqliteDB),
		relSys,
		stringSys,
		nameSys: buildNameSys({ relSys, stringSys })
	};
}

// istanbul ignore if
if(!module.parent) {
	let dbFile = process.argv[2];
	if(!dbFile)
		throw new Error("Please specify database file");

	let sqliteDB = new sqlite3.Database(dbFile);
	let systems = buildSystems(sqliteDB);

	init(systems);
}
