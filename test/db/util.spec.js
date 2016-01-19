import { expect } from "chai";
import sqlite3 from "sqlite3";

import _ from "lodash";

import { getSqlQMarks } from "kitsune/util";
import getDB from "kitsune/systems/db/cache";
import { buildQuery, queryBuilder as q } from "kitsune/systems/db/util";

let sqliteDB = getDB();

let allP;

before((done) => sqliteDB.initP
	   .then(sys => {
		   let dbSys = sys.dbSys;
		   allP = dbSys.allP;
	   })
	   .then(() => done(), done));

describe("kitsune/systems/db/util", function() {

	describe("buildQuery(query, args)", function() {
		it("should assemble a query and it's args from an object", function() {
			var queryArgs = buildQuery({
				query: "one (${one}) two (${two}) three (${three})",
				args: {
					one: [1,2,3,4],
					two: {
						query: "SELECT * FROM (${subQuery}) WHERE id IN (${nodes})",
						args: {
							subQuery: {
								query: "SELECT * FROM nodes WHERE a IN (${nodes}) AND b IN (${criteria})",
								args: {
									nodes: [10,20,30,40],
									criteria: ["alpha", "beta"]
								}
							},
							nodes: ["nodeA", "nodeB", "nodeC", "nodeD", "nodeE"]
						}
					},
					three: {
						query: "SELECT YOUR MOM FROM (${nodes})",
						args: {
							nodes: ["a","b","c"]
						}
					}
				}
			});

			expect(queryArgs.query).to.equal(
				"one (?, ?, ?, ?) " +
				"two (SELECT * FROM (SELECT * FROM nodes WHERE a IN (?, ?, ?, ?) AND b IN (?, ?)) WHERE id IN (?, ?, ?, ?, ?)) " +
					"three (SELECT YOUR MOM FROM (?, ?, ?))");
			expect(queryArgs.args).to.deep.equal([ 1, 2, 3, 4,
											  10, 20, 30, 40,
											  'alpha', 'beta',
											  'nodeA', 'nodeB', 'nodeC', 'nodeD', 'nodeE',
											  'a', 'b', 'c' ]);
		});
	});

	describe("queryBuilder(initial)", function() {
		it("should build a queryAndArgs object based upon arguments and return a chain object", function() {
			var queryObj = q(["START", "END"]).op("Hello (${nodes}) World").op("What's up (${nodes})");
			var queryArgs = buildQuery(queryObj);

			expect(queryArgs.query).to.equal("What's up (Hello (?, ?) World)");
			expect(queryArgs.args).to.deep.equal(["START", "END"]);
		});

		it("should work when starting with a string instead of an array", function() {
			var queryObj = q("START").op("Hello (${nodes}) World").op("What's up (${nodes})");
			var queryArgs = buildQuery(queryObj);

			expect(queryArgs.query).to.equal("What's up (Hello (START) World)");
			expect(queryArgs.args).to.deep.equal([]);
		});
	});
});
