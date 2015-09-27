import { expect } from "chai";
import _ from "lodash";
import sqlite3 from "sqlite3";

import buildDB from "kitsune/db";
import { ids } from "kitsune/db";
import * as util from "kitsune/db/util";

var sqliteDB = new sqlite3.Database("data/test.db");
var db = buildDB(sqliteDB);

describe("kitsune/db", function() {

	describe("createNode(type)", function() {
		it("should create a \"type\" node", function(done) {
			db.createNode(ids.node)
				.then(function(id) {
					expect(id).to.not.equal(null);
				})
				.then(done, done);
		});

		it("should create a generic node by default (no args)", function(done) {
			db.createNode()
				.then(db.getType)
				.then(function(type) {
					expect(type).to.equal(ids.node);
				})
				.then(done, done);
		});
	});

	describe("createNodes(count, type)", function() {
		it("should create multiple \"type\" nodes (default generic type)", function(done) {
			db.createNodes(5)
				.then(function(nodes) {
					expect(nodes).to.have.length(5);
				})
				.then(done, done);
		});
	});

	describe("create(type, data)", function() {
		it("should save a node with it's type and data", function(done) {

			db.create(ids.string, { string: "Super power" })
				.then(db.getType)
				.then(function(type) {
					expect(type).to.equal(ids.string);
				})
				.then(done, done);

		});
	});

	describe("relate(head, tail)", function() {
		it("should create a generic relationship between two nodes", function(done) {

			db.createNodes(2)
				.then(function(nodes) {
					return db.relate(nodes[0], nodes[1]);
				})
				.then(db.getType)
				.then(function(type) {
					expect(type).to.equal(ids.relationship);
				})
				.then(done, done);
		});

		it("should create multple relationships if an array is passed to tail", function(done) {
			db.createNodes(3)
				.then(function(nodes) {
					var [ parent, childA, childB ] = nodes;
					return db.relate(parent, [childA, childB]);
				})
				.then(function(relationshipIds) {
					expect(relationshipIds).to.have.length(2);
				})
				.then(done, done);
		});
	});

	describe("rels(node, type)", function() {
		// TODO: Resolve this
		this.timeout(5000);
		it("should return an array of all relationships", function(done) {

			var nodeA, nodeB, nodeC;
			db.createNodes(3)
				.then(function(nodes) {

					[ nodeA, nodeB, nodeC ] = nodes;

					return Promise.all([
						db.relate(nodeA, nodeB),
						db.relate(nodeA, nodeC)
					]);
				})
				.then(function() {
					return db.rels(nodeA);
				})
				.then(function(relatedNodes) {
					var nodeIds = _.pluck(relatedNodes, "tail");
					expect(nodeIds).to.have.members([nodeB, nodeC]);
				})
				.then(done, done);
		});

		it("should return an array of all relationships in either direction", function(done) {

			var nodeA, nodeB, nodeC;
			db.createNodes(3)
				.then(function(nodes) {

					[ nodeA, nodeB, nodeC ] = nodes;

					return Promise.all([
						db.relate(nodeA, nodeB),
						db.relate(nodeC, nodeA)
					]);
				})
				.then(function() {
					return db.rels(nodeA);
				})
				.then(function(relatedNodes) {
					var nodeIds = _.map(relatedNodes, _.partial(util.otherNode, nodeA));
					expect(nodeIds).to.have.members([nodeB, nodeC]);
				})
				.then(done, done);
		});

		it("should return an array of all relationships that match \"type\"", function(done) {

			var parent, typeA, typeB, genericChild, typeAChild, typeAChild2, typeBChild, typeABChild;
			db.createNodes(8)
				.then(function(nodes) {
					[ parent, typeA, typeB, genericChild, typeAChild, typeAChild2, typeBChild, typeABChild ] = nodes;
					return Promise.all([
						db.relate(parent, genericChild),

						db.relate(parent, typeAChild, typeA),
						db.relate(parent, typeBChild, typeB),

						db.relate(parent, typeAChild2, typeA),

						db.relate(parent, typeABChild, typeA),
						db.relate(parent, typeABChild, typeB)
					]);
				})
				.then(function() {
					return db.rels(parent, typeA);
				})
				.then(function(rels) {
					var tails = _.pluck(rels, "tail");
					expect(tails).to.have.members([typeAChild, typeAChild2, typeABChild]);
				})
				.then(done, done);
		});
	});

	describe("nameNode(node, name)", function() {
		it("creates a \"name\" relationship bewteen a node and a new string", function(done) {
			var newNode;
			db.createNode()
				.then(function(node) {
					newNode = node;
					return db.nameNode(newNode, "newNode");
				})
				.then(function() {
					return db.getNames(newNode);
				}).then(function(rows) {
					return _.pluck(rows, "string");
				}).then(util.one)
				.catch(function(arr) {
					throw new Error("Expecting only one result: [" + arr + "]");
				})
				.then(function(name) {
					expect(name).to.equal("newNode");
				})
				.then(done, done);
		});

		it("creates multiple \"name\" relationships for one node", function(done) {
			var newNode;
			db.createNode()
				.then(function(node) {
					newNode = node;
					return Promise.all([
						db.nameNode(newNode, "nameA"),
						db.nameNode(newNode, "nameB")
					]);
				})
				.then(function() {
					return db.getNames(newNode);
				})
				.then(function(rows) {
					return _.pluck(rows, "string");
				})
				.then(function(names) {
					expect(names).to.have.members(["nameA", "nameB"]);
				})
				.then(done, done);
		});
	});

	describe("byName(nameStr)", function() {
		this.timeout(5000);
		it("resolves a list of nodes that are have \"name\" relationships to a string \"nameStr\"", function(done) {
			var newNodes;
			db.createNodes(3)
				.then(function(nodes) {
					newNodes = nodes;
					return Promise.all(_.map(newNodes, function(node) {
						return db.nameNode(node, "thisName");
					}));
				})
				.then(function() {
					return db.byName("thisName");
				})
				.then(function(nodes) {
					expect(nodes).to.include.members(newNodes);
				})
				.then(done, done);
		});
	});
});
