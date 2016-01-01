import { expect } from "chai";
import sqlite3 from "sqlite3";

import _ from "lodash";

import { getSqlQMarks } from "kitsune/util";
import getDB from "kitsune/systems/db/cache";
import { buildQuery } from "kitsune/systems/db/util";

let sqliteDB = getDB();

let allP;

before((done) => sqliteDB.initP
	   .then(systems => {
		   let dbSys = systems.dbSys;
		   allP = dbSys.allP;
	   })
	   .then(() => done(), done));

describe("kitsune/node", function() {

	describe("search(criteria)", function() {

		it.skip("should work", function() {
			expect(false).to.equal(true);
		});
	});
});