import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";
import { createIds, one } from "kitsune/util";

let sqliteDB = getDB();

let edgeSys, dictSys;

before(done => sqliteDB.initP
	   .then(systems => {
		   edgeSys = systems.edgeSys;
		   dictSys = systems.dictSys;
	   })
	   .then(() => done(), done));

describe("kitsune/systems/dict", function() {

	describe("put(node, key, value)", function() {
		it('should create a "key" type relationship between "node" and "value"', function(done) {

			let [node, key, value] = createIds(3);

			dictSys.put(node, key, value)
				.then(edge => {
					expect(edge).to.contain({ head: node, tail: value });
					return edgeSys.getHeads(edge.id);
				})
				.then(one)
				.then(key => {
					expect(key).to.equal(key);
				})
				.then(done, done);
		});
	});

	describe("get(node, key)", function() {
		it("resolves a list of value nodes that have \"key\" edges from node", function(done) {

			let [node, key, valueA, valueB] = createIds(4);

			Promise.all([
				dictSys.put(node, key, valueA),
				dictSys.put(node, key, valueB)
			])
				.then((val) => dictSys.get(node, key))
				.then(values => {
					expect(values).to.have.members([valueA, valueB]);
				})
				.then(done, done);
		});
	});

	describe("getHead(value, key)", function() {
		it("resolves a list of nodes that have \"key\" edges to value", function(done) {

			let [nodeA, nodeB, key, value] = createIds(4);

			Promise.all([
				dictSys.put(nodeA, key, value),
				dictSys.put(nodeB, key, value)
			])
				.then(() => dictSys.getHead(value, key))
				.then(ids => {
					expect(ids).to.have.members([nodeA, nodeB]);
				})
				.then(done, done);
		});
	});
});
