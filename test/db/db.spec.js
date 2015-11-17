import { expect } from "chai";
import _ from "lodash";
import sqlite3 from "sqlite3";

import buildDB from "kitsune/db";
import { ids } from "kitsune/db";
import init from "kitsune/db/init";
import * as util from "kitsune/db/util";

var sqliteDB = new sqlite3.Database(":memory:");
// sqliteDB.on("trace", function(sql) {
//		console.log(sql);
// });
init(sqliteDB);
var db = buildDB(sqliteDB);

describe("kitsune/db", function() {

	describe("getRel(ids)", function() {
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
				.then(db.getRels)
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

	describe("getTails(head)", function() {
		it("should get all tails of provided head", function(done) {
			var [head, tailA, tailB] = util.createIds(3);

			db.relate(head, tailA, tailB)
				.then(db.getRel)
				.then((rels) => db.getTails(head))
				.then((tails) => {
					expect(tails).to.contain(tailA, tailB);
				})
				.then(done, done);
		});
	});

	describe("getHeads(tail)", function(done) {
		it("should get all heads of provided tail", function() {
			var [headA, headB, tail] = util.createIds(3);

			Promise.all(_.map(
				[headA, headB],
				(head) => db.relate(head, tail)
			))
				.then((relIds) => Promise.all(_.map(relIds, (id) => db.getRel(id))))
				.then((rels) => db.getHeads(tail))
				.then((heads) => {
					expect(heads).to.contain(headA, headB);
				})
				.then(done, done);
		});
	});

	describe("name(id, nameId)", function() {
		it("creates a \"name\" relationship bewteen a node and a specified node", function(done) {

			var [id, nameId] = util.createIds(2);

			db.name(id, nameId)
				.then((nameRel) => {
					expect(nameRel.head).to.equal(ids.name);
					return db.getRel(nameRel.tail);
				})
				.then((rel) => {
					expect(rel).to.contain({ head: id, tail: nameId });
				})
				.then(done, done);
		});
	});

	describe.skip("nameByStr(id, nameStr)", function() {
		it("should name a node using the string itself as a parameter", function() {});
	});

	describe("findByName(nameId)", function() {
		it("resolves a list of nodes that are have \"name\" relationships to nameId", function(done) {

			var [nodeA, nodeB, nameId] = util.createIds(3);

			Promise.all([
				db.name(nodeA, nameId),
				db.name(nodeB, nameId)
			])
				.then(() => db.findByName(nameId))
				.then((ids) => {
					expect(ids).to.have.members([nodeA, nodeB]);
				})
				.then(done, done);
		});
	});
});
