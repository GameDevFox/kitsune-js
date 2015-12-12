import { expect } from "chai";
import _ from "lodash";
import sqlite3 from "sqlite3";

import getDB from "kitsune/db/cache";
import ids from "kitsune/ids";
import bindRel from "kitsune/rel";
import * as util from "kitsune/util";

let sqliteDB = getDB();

let relSys = bindRel(sqliteDB);

before((done) => sqliteDB.initP.then(() => done(), done));

describe("kitsune/rel", function() {

	describe("get(ids)", function() {
		it("should return the relationship data for this id", function() {
			// noop
		});
	});

	describe("relate(head, ...tails)", function() {
		it("should create a generic relationship between two nodes", function(done) {

			let [head, tail] = util.createIds(2);

			relSys.relate(head, tail)
				.then(relSys.get)
				.then(rel => {
					expect(rel).to.include({ head: head, tail: tail });
				})
				.then(done, done);
		});

		it("should create multple relationships if multiple values are passed to tail", function(done) {

			let [ parent, childA, childB ] = util.createIds(3);

			relSys.relate(parent, childA, childB)
				.then(relSys.getMany)
				.then(rels => {
					// NOTE: This failed once, randomly
					expect(rels[0]).to.include({ head: parent, tail: childA });
					expect(rels[1]).to.include({ head: parent, tail: childB });
				})
				.then(done, done);
		});

		it("should allow null tails", function(done) {
			let head = util.createId();
			relSys.relate(head)
				.then(relSys.get)
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
			relSys.relate(nodeA, nodeB)
				.then(id => {
					relId = id;
					return relSys.get(id);
				})
				.then(rel => {
					expect(rel).to.include({ head: nodeA, tail: nodeB });
					return relSys.del(relId);
				})
				.then(relSys.get)
				.then(rel => {
					expect(rel).to.equal(undefined);
				})
				.then(done, done);
		});
	});

	describe("getTails(head)", function() {
		it("should get all tails of provided head", function(done) {
			let [head, tailA, tailB] = util.createIds(3);

			relSys.relate(head, tailA, tailB)
				.then(relSys.getMany)
				.then(rels => relSys.getTails(head))
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
				head => relSys.relate(head, tail)
			))
				.then(relIds => Promise.all(_.map(relIds, id => relSys.get(id))))
				.then(rels => relSys.getHeads(tail))
				.then(heads => {
					expect(heads).to.contain(headA, headB);
				})
				.then(done, done);
		});
	});

	it.skip("TODO: Assign multiple head/tails ???", function() {});

	describe("assign(relType, head, tail)", function() {
		it("creates a \"relType\" relationship bewteen a head node and a tail node", function(done) {

			let [relType, head, tail] = util.createIds(3);

			relSys.assign(relType, head, tail)
				.then(rel => {
					expect(rel.head).to.equal(relType);
					return relSys.get(rel.tail);
				})
				.then(rel => {
					expect(rel).to.contain({ head, tail });
				})
				.then(done, done);
		});
	});

	describe("findByTail(relType, tail)", function() {
		it("resolves a list of nodes that are have \"relType\" relationships to tail", function(done) {

			let [relType, nodeA, nodeB, nameId] = util.createIds(4);

			Promise.all([
				relSys.assign(relType, nodeA, nameId),
				relSys.assign(relType, nodeB, nameId)
			])
				.then(() => relSys.findByTail(relType, nameId))
				.then(ids => {
					expect(ids).to.have.members([nodeA, nodeB]);
				})
				.then(done, done);
		});
	});

	describe("findByHead(relType, head)", function() {
		it("resolves a list of nodes that are have \"relType\" relationships to head", function(done) {

			let [relType, node, nameA, nameB] = util.createIds(4);

			Promise.all([
				relSys.assign(relType, node, nameA),
				relSys.assign(relType, node, nameB)
			])
				.then(() => relSys.findByHead(relType, node))
				.then(nameIds => {
					expect(nameIds).to.have.members([nameA, nameB]);
				})
				.then(done, done);
		});
	});
});
