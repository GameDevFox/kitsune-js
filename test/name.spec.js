import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";
import { createId, logP } from "kitsune/util";

let sqliteDB = getDB();

let edgeSys, stringSys, nameSys;

before((done) => sqliteDB.initP
	   .then(systems => {
		   edgeSys = systems.edgeSys;
		   stringSys = systems.stringSys;
		   nameSys = systems.nameSys;
	   })
	   .then(() => done(), done));

describe("kitsune/name", function() {

	describe("name(id, nameStr)", function() {
		it("should name the node with provided string", function(done) {
			var id = createId();
			nameSys.name(id, "myName")
				.then(edge => nameSys.getNodes("myName"))
				.then(ids => {
					expect(ids).to.deep.equal([id]);
				})
				.then(done, done);
		});
	});

	describe("getNodes(nameStr)", function() {
		it("should return a list of all nodes that have the name provided", function() {});
	});

	describe("getNames(id)", function() {
		it("should return a list of all names that this node is known by", function(done) {
			var id = createId();

			Promise.all([
				nameSys.name(id, "yourName"),
				nameSys.name(id, "thisName")
			])
				.then(edge => nameSys.getNames(id))
				.then(names => {
					expect(names).to.have.members(["yourName", "thisName"]);
				})
				.then(done, done);
		});
	});
});
