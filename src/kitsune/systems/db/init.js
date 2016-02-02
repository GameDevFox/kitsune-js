#!/usr/bin/env node
import _ from "lodash";
import sqlite3 from "sqlite3";

import { noop } from "katana/func";
import { log } from "katana/system";

import ids from "kitsune/ids";
import { aliases, tables, typeQs, opQs as ops, types, views } from "kitsune/ids";
import bindDB from "kitsune/systems/db";
import { buildQuery, queryBuilder as q } from "kitsune/systems/db/util";

import bindNodeSys from "kitsune/systems/node";
import bindEdgeSys from "kitsune/systems/edge";
import bindTypeSys from "kitsune/systems/type";
import bindStrSys from "kitsune/systems/string";

import buildMapSys from "kitsune/systems/map";
import buildChainSys from "kitsune/systems/chain";
import buildNameSys from "kitsune/systems/name";

import { logP } from "kitsune/util";

export default function initDB(sqliteDB) {
	var systems = buildSystems(sqliteDB);
	return init(systems);
}

export function init(systems) {

	var { dbSys, edgeSys, stringSys, nameSys } = systems;
	var { alias, create, view } = dbSys;

	// edge database
	return createTables(systems)
		.then(createAliases(dbSys))
		.then(createViews(dbSys))
		.then(() => nameIds(nameSys))
		.then(() => markTypes(edgeSys))
		.then(() => markTables(edgeSys))
		.then(() => insertQueries(edgeSys, stringSys))
		.then(() => systems)
		.catch(console.error);
}

function createTables({ dbSys: { alias, create }, mapSys }) {
	var promises = _.map(tables, (table, name) => {
		let tableId = "t"+table.id;
		return create(tableId, table.columns)
			.then(alias(tableId, name))
			// Mark tables
			.then(mapSys.put(ids.table, ids.is, table.id));
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
			.then(alias(tableId, viewName))
			.catch(e => console.log(e));
	});
	return Promise.all(promises);
}

function nameIds(nameSys) {
	var promises = _.map(ids, (value, name) => nameSys.name(value, name));
	return Promise.all(promises);
}

function markTypes(edgeSys) {
	var promises = _.map(types, (type) => edgeSys.create(ids.type, type));
	return Promise.all(promises);
}

function markTables(edgeSys) {
	var promises = _.map(tables, (table, tableName) => {
		return edgeSys.create(ids.table, table.id);
	});
	return Promise.all(promises);
}

function insertQueries(edgeSys, stringSys) {
	var queries = _.extend(ops, typeQs);

	var promises = _.map(queries, (query, queryName) => {
		return stringSys.put(query)
			.then(queryId => {
				return edgeSys.create(ids.query, queryId);
			});
	});
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

	let dbSys = bindDB(sqliteDB);

	let nodeSys = bindNodeSys(sqliteDB);
	let edgeSys = bindEdgeSys(sqliteDB);
	let stringSys = bindStrSys(sqliteDB);
	let typeSys = bindTypeSys(sqliteDB);

	let mapSys = buildMapSys({ dbSys, edgeSys });
	let chainSys = buildChainSys({ mapSys });
	let nameSys = buildNameSys({ mapSys, stringSys });

	return {
		dbSys,

		nodeSys,
		edgeSys,
		stringSys,
		typeSys,

		mapSys,
		chainSys,
		nameSys
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
