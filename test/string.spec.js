import { expect } from "chai";
import sqlite3 from "sqlite3";

import bindDB from "kitsune/db";
import init from "kitsune/db/init";
import bindStrSys from "kitsune/string";
import { logP } from "kitsune/util";

let sqliteDB = new sqlite3.Database(":memory:");
let dbSys = bindDB(sqliteDB);

let strSys = bindStrSys(sqliteDB);

before((done) => init(dbSys).then(done, done));

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

	describe("getAll(...ids)", function() {
		it("should return an string for each id", function(done) {
			Promise.all([
				strSys.put("one"),
				strSys.put("two")
			])
				.then(ids => strSys.getAll(...ids))
				.then((strings) => {
					expect(strings).to.have.members(["one", "two"]);
				})
				.then(done, done);
		});
	});
});
