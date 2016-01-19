import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";
import * as util from "kitsune/util";

let sqliteDB = getDB();

let dictSys, edgeSys;

before(done => sqliteDB.initP
	   .then(systems => {
		   edgeSys = systems.edgeSys;
		   dictSys = systems.dictSys;
	   })
	   .then(() => done(), done));

describe("kitsune/systems/dict", function() {

	describe("put(node, key, value)", function() {

		it.skip("TODO: Assign multiple head/tails ???", function() {});
		
		it('should create a "key" type relationship between "node" and "value"', function(done) {

			let [node, key, value] = util.createIds(3);

			dictSys.put(node, key, value)
				.then(edge => {
					expect(edge.head).to.equal(key);
					return edgeSys.get(edge.tail);
				})
				.then(edge => {
					expect(edge).to.contain({ head: node, tail: value });
				})
				.then(done, done);
		});
	});
});
