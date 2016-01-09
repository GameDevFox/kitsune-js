import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";

let sqliteDB = getDB();

let systems;

before((done) => sqliteDB.initP
	   .then(sys => systems = sys)
	   .then(() => done(), done));

describe("kitsune/systems/dict", function() {

	describe("put(node, key, value)", function() {
		it('should create a "key" type relationship between "node" and "value"', function() {
			console.log(systems);
			expect(false).to.equal(true);
		});
	});
});