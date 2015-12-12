import { expect } from "chai";
import sqlite3 from "sqlite3";

import getDB from "kitsune/db/cache";
import bindStrSys from "kitsune/string";
import { logP } from "kitsune/util";

let sqliteDB = getDB();

let strSys = bindStrSys(sqliteDB);

before((done) => sqliteDB.initP.then(() => done(), done));

describe("kitsune/string", function() {

	describe("put(str)", function() {
		it("should return the hash/id of the string", function(done) {
			strSys.put("relationship")
				.then(strId => {
					expect(strId).to.equal("6a73a9121a5de29346900d4f866e89b5f9e284dc");
				})
				.then(done, done);
		});
	});

	describe("get(id)", function() {
		it("should return the string for id", function(done) {
			strSys.put("string")
				.then(id => strSys.get(id))
				.then(str => {
					expect(str).to.equal("string");
				})
				.then(done, done);
		});

		it("should return undefined if the string isn't found", function(done) {
			strSys.get("unknown")
				.then(id => {
					expect(id).to.equal(undefined);
				})
				.then(done, done);
		});
	});

	describe("getMany(...ids)", function() {
		it("should return an string for each id", function(done) {
			Promise.all([
				strSys.put("one"),
				strSys.put("two")
			])
				.then(ids => strSys.getMany(...ids))
				.then((strings) => {
					expect(strings).to.have.members(["one", "two"]);
				})
				.then(done, done);
		});
	});

	describe("del(id)", function() {
		it("should delete a string entry from the database", function(done) {
			let msg = "Hello World";

			let strId;
			strSys.put(msg)
				.then(id => { strId = id; })
				.then(() => strSys.get(strId))
				.then(str => { expect(str).to.equal(msg); })
				.then(() => strSys.del(strId))
				.then(() => strSys.get(strId))
				.then(str => {
					expect(str).to.equal(undefined);
				})
				.then(done, done);
		});
	});
});
