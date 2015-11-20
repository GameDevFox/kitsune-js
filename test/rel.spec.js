import { expect } from "chai";
import _ from "lodash";
import sqlite3 from "sqlite3";

import init from "kitsune/db/init";

import ids from "kitsune/ids";
import bindRel from "kitsune/rel";
import * as util from "kitsune/util";

let sqliteDB = new sqlite3.Database(":memory:");
// sqliteDB.on("trace", function(sql) {
//		console.log(sql);
// });
init(sqliteDB);
let relDB = bindRel(sqliteDB);

describe("kitsune/rel", function() {

	describe("getRel(ids)", function() {
		it("should return the relationship data for this id", function() {
			// noop
		});
	});

	describe("relate(head, ...tails)", function() {
		it("should create a generic relationship between two nodes", function(done) {

			let [head, tail] = util.createIds(2);

			relDB.relate(head, tail)
				.then(relDB.getRel)
				.then(rel => {
					expect(rel).to.include({ head: head, tail: tail });
				})
				.then(done, done);
		});

		it("should create multple relationships if multiple values are passed to tail", function(done) {

			let [ parent, childA, childB ] = util.createIds(3);

			relDB.relate(parent, childA, childB)
				.then(relDB.getRels)
				.then(rels => {
					// NOTE: This failed once, randomly
					expect(rels[0]).to.include({ head: parent, tail: childA });
					expect(rels[1]).to.include({ head: parent, tail: childB });
				})
				.then(done, done);
		});

		it("should allow null tails", function(done) {
			let head = util.createId();
			relDB.relate(head)
				.then(relDB.getRel)
				.then(rel => {
					expect(rel).to.contain({ head: head, tail: null });
				})
				.then(done, done);
		});
	});

	describe("del(...ids)", function() {
		it("should delete relationships from the system", function(done) {
			let [nodeA, nodeB] = util.createIds(2);

			let relId;
			relDB.relate(nodeA, nodeB)
				.then(id => {
					relId = id;
					return relDB.getRel(id);
				})
				.then(rel => {
					expect(rel).to.include({ head: nodeA, tail: nodeB });
					return relDB.del(relId);
				})
				.then(relDB.getRel)
				.then(rel => {
					expect(rel).to.equal(undefined);
				})
				.then(done, done);
		});
	});

	describe("getTails(head)", function() {
		it("should get all tails of provided head", function(done) {
			let [head, tailA, tailB] = util.createIds(3);

			relDB.relate(head, tailA, tailB)
				.then(relDB.getRel)
				.then(rels => relDB.getTails(head))
				.then(tails => {
					expect(tails).to.contain(tailA, tailB);
				})
				.then(done, done);
		});
	});

	describe("getHeads(tail)", function(done) {
		it("should get all heads of provided tail", function() {
			let [headA, headB, tail] = util.createIds(3);

			Promise.all(_.map(
				[headA, headB],
				head => relDB.relate(head, tail)
			))
				.then(relIds => Promise.all(_.map(relIds, id => relDB.getRel(id))))
				.then(rels => relDB.getHeads(tail))
				.then(heads => {
					expect(heads).to.contain(headA, headB);
				})
				.then(done, done);
		});
	});

	describe("name(id, nameId)", function() {
		it("creates a \"name\" relationship bewteen a node and a specified node", function(done) {

			let [id, nameId] = util.createIds(2);

			relDB.name(id, nameId)
				.then(nameRel => {
					expect(nameRel.head).to.equal(ids.name);
					return relDB.getRel(nameRel.tail);
				})
				.then(rel => {
					expect(rel).to.contain({ head: id, tail: nameId });
				})
				.then(done, done);
		});
	});

	describe("findByName(nameId)", function() {
		it("resolves a list of nodes that are have \"name\" relationships to nameId", function(done) {

			let [nodeA, nodeB, nameId] = util.createIds(3);

			Promise.all([
				relDB.name(nodeA, nameId),
				relDB.name(nodeB, nameId)
			])
				.then(() => relDB.findByName(nameId))
				.then(ids => {
					expect(ids).to.have.members([nodeA, nodeB]);
				})
				.then(done, done);
		});
	});

	describe("getNames(id)", function() {
		it("should return a list a all name nodes for this node", function(done) {

			let [node, nameA, nameB] = util.createIds(3);

			Promise.all([
				relDB.name(node, nameA),
				relDB.name(node, nameB)
			])
				.then(() => relDB.getNames(node))
				.then(nameIds => {
					expect(nameIds).to.have.members([nameA, nameB]);
				})
				.then(done, done);
		});
	});
});
