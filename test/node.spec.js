import { expect } from "chai";
import sqlite3 from "sqlite3";

import _ from "lodash";

import getDB from "kitsune/systems/db/cache";
import { buildQuery } from "kitsune/systems/db/util";

let sqliteDB = getDB();

let nodeSys;

before((done) => sqliteDB.initP
	   .then(systems => {
		   nodeSys = systems.nodeSys;
	   })
	   .then(() => done(), done));

describe("kitsune/node", function() {

	describe("search(criteria)", function() {

		it("should return a complete list of all nodes", function(done) {
			nodeSys.search()
				.then(nodes => {
					expect(_.isArray(nodes)).to.equal(true);
					expect(nodes.length).to.not.equal(0);
				})
				.then(done, done);
		});
	});
});
