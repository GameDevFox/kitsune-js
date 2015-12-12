#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { noop } from "katana/func";
import { log } from "katana/system";

import ids from "kitsune/ids";
import { aliases, tables, views } from "kitsune/ids";
import bindDB from "kitsune/db";
import bindIdSys from "kitsune/id";
import bindRelSys from "kitsune/rel";
import bindStrSys from "kitsune/string";
import buildNameSys from "kitsune/name";
import { logP } from "kitsune/util";

export default function initDB(sqliteDB) {
	var systems = buildSystems(sqliteDB);
	return init(systems);
}

export function init(systems) {

	var { dbSys, nameSys, stringSys } = systems;
	var { alias, create, view } = dbSys;

	// rel database
	return createTables(dbSys)
		.then(createAliases(dbSys))
		.then(createViews(dbSys))
		.then(() => nameIds(nameSys))
		// .then(() => addStrings(stringSys, nameSys))
		.then(() => systems)
		.catch(console.error);
}

function createTables({ alias, create }) {
	var promises = _.map(tables, (table, name) => {
		let tableId = "t"+table.id;
		return create(tableId, table.columns)
			.then(alias(tableId, name));
	});
	return Promise.all(promises);
}

function createAliases({ alias: aliasFn }) {
	var promises = _.map(aliases, (name, alias) => aliasFn(name, alias));
	return Promise.all(promises);
}

function createViews({ alias, view: viewFn }) {
	var promises = _.map(views, (view, viewName) => {
	var tableId = "t"+view.id;
		return viewFn(tableId, view.query)
			.then(alias(tableId, viewName));
	});
	return Promise.all(promises);
}

function nameIds(nameSys) {
	var promises = _.map(ids, (value, name) => nameSys.name(value, name));
	return Promise.all(promises);
}

// function addStrings(stringSys, nameSys) {
//		var promises = _.map(strings, (string, name) => {
//			return stringSys.put(string)
//				.then(strId => {
//					return nameSys.name(strId, name);
//				});
//		});
//		return Promise.all(promises);
// }

// TODO: Move to new file?
export function buildSystems(sqliteDB) {

	let relSys = bindRelSys(sqliteDB);
	let stringSys = bindStrSys(sqliteDB);
	let idSys = bindIdSys(sqliteDB);

	return {
		dbSys: bindDB(sqliteDB),
		idSys,
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
