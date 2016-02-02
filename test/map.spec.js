import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";
import { createIds, one } from "kitsune/util";

let sqliteDB = getDB();

let edgeSys, mapSys;

before(done => sqliteDB.initP
	   .then(systems => {
		   edgeSys = systems.edgeSys;
		   mapSys = systems.mapSys;
	   })
	   .then(() => done(), done));

describe("kitsune/systems/map", function() {

	describe("put(node, key, value)", function() {
		it('should create a "key" type relationship between "node" and "value"', function(done) {

			let [node, key, value] = createIds(3);

			mapSys.put(node, key, value)
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
				mapSys.put(node, key, valueA),
				mapSys.put(node, key, valueB)
			])
				.then((val) => mapSys.get(node, key))
				.then(values => {
					expect(values).to.have.members([valueA, valueB]);
				})
				.then(done, done);
		});
	});

	describe("getKey(node, value)", function() {
		it("resolves a list of key nodes that map node to value", function(done) {

			let [node, keyA, keyB, value] = createIds(4);

			Promise.all([
				mapSys.put(node, keyA, value),
				mapSys.put(node, keyB, value),
			])
				.then((val) => mapSys.getKey(node, value))
				.then(keys => {
					expect(keys).to.have.members([keyA, keyB]);
				})
				.then(done, done);
		});
	});

	describe("getHead(value, key)", function() {
		it("resolves a list of nodes that have \"key\" edges to value", function(done) {

			let [nodeA, nodeB, key, value] = createIds(4);

			Promise.all([
				mapSys.put(nodeA, key, value),
				mapSys.put(nodeB, key, value)
			])
				.then(() => mapSys.getHead(value, key))
				.then(ids => {
					expect(ids).to.have.members([nodeA, nodeB]);
				})
				.then(done, done);
		});
	});
});
