import { expect } from "chai";
import _ from "lodash";
import sqlite3 from "sqlite3";

import buildDB from "kitsune/db";
import { ids } from "kitsune/db";
import init from "kitsune/db/init";
import * as util from "kitsune/db/util";

var sqliteDB = new sqlite3.Database(":memory:");
init(sqliteDB);
var db = buildDB(sqliteDB);

describe("kitsune/db", function() {

	describe("getRel(id)", function() {
		it("should return the relationship data for this id", function() {
			// noop
		});
	});

	describe("relate(head, tail)", function() {
		it("should create a generic relationship between two nodes", function(done) {

			var [head, tail] = util.createIds(2);

			db.relate(head, tail)
				.then(db.getRel)
				.then((rel) => {
					expect(rel).to.include({ head: head, tail: tail });
				})
				.then(done, done);
		});

		it("should create multple relationships if multiple values are passed to tail", function(done) {

			var [ parent, childA, childB ] = util.createIds(3);

			db.relate(parent, childA, childB)
				.then((relIds) => Promise.all(_.map(relIds, (id) => db.getRel(id))))
				.then((rels) => {
					expect(rels[0]).to.include({ head: parent, tail: childA });
					expect(rels[1]).to.include({ head: parent, tail: childB });
				})
				.then(done, done);
		});

		it("should allow null tails", function(done) {
			var head = util.createId();
			db.relate(head)
				.then(db.getRel)
				.then((rel) => {
					expect(rel).to.contain({ head: head, tail: null });
				})
				.then(done, done);
		});
	});

	describe.skip("getTails(head)", function() {
		it("should get all tails of provided head", function() {
			expect(true).to.equal(false);
		});
	});

	describe.skip("getHeads(head)", function() {
		it("should get all heads of provided tail", function() {
			expect(true).to.equal(false);
		});
	});

	describe.skip("name(id, name)", function() {
		it("creates a \"name\" relationship bewteen a node and a new string", function(done) {
			var newNode;
			db.createNode()
				.then(node => {
					newNode = node;
					return db.nameNode(newNode, "newNode");
				})
				.then(() => db.getNames(newNode))
				.then(rows => _.pluck(rows, "string"))
				.then(util.one)
				.catch(arr => {
					throw new Error("Expecting only one result: [" + arr + "]");
				})
				.then(name => { expect(name).to.equal("newNode"); })
				.then(done, done);
		});

		it("creates multiple \"name\" relationships for one node", function(done) {
			var newNode;
			db.createNode()
				.then(node => {
					newNode = node;
					return Promise.all([
						db.nameNode(newNode, "nameA"),
						db.nameNode(newNode, "nameB")
					]);
				})
				.then(() => db.getNames(newNode))
				.then(names => _.pluck(names, "string"))
				.then(names => { expect(names).to.have.members(["nameA", "nameB"]); })
				.then(done, done);
		});
	});

	describe.skip("byName(nameStr)", function() {
		it("resolves a list of nodes that are have \"name\" relationships to a string \"nameStr\"", function(done) {
			var newNodes;
			db.createNodes(3)
				.then(nodes => {
					newNodes = nodes;
					return Promise.all(_.map(newNodes, function(node) {
						return db.nameNode(node, "thisName");
					}));
				})
				.then(() => db.byName("thisName"))
				.then(nodes => { expect(nodes).to.include.members(newNodes); })
				.then(done, done);
		});
	});
});
