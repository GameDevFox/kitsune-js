import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";
import { createIds } from "kitsune/util";

let sqliteDB = getDB();

let chainSys;

before(done => sqliteDB.initP
	   .then(systems => {
		   chainSys = systems.chainSys;
	   })
	   .then(() => done(), done));

describe("kitsune/systems/chain", function() {

	describe("create(nodes)", function() {
		it('connects the given nodes together in a "leap-frog" chain', function(done) {
			let nodes = createIds(5);

			chainSys.create(nodes)
				.then(chainSys.getAll)
				.then(result => {
					expect(result).to.deep.equal(nodes);
				})
				.then(done, done);
		});
	});
});
