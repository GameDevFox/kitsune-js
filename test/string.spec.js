import { expect } from "chai";
import sqlite3 from "sqlite3";

import bindDB from "kitsune/string";
import init from "kitsune/db/init";


let sqliteDB = new sqlite3.Database(":memory:");
init(sqliteDB);
let str = bindDB(sqliteDB);

describe("kitsune/string", function() {

	describe("create(str)", function() {
		it("should return the hash/id of the string", function(done) {
			str.create("relationship")
				.then(strId => {
					expect(strId).to.equal("6a73a9121a5de29346900d4f866e89b5f9e284dc");
				})
				.then(done, done);
		});
	});

	describe("get(id)", function() {
		it("should return the string for id", function(done) {

			str.create("string")
				.then(id => str.get(id))
				.then(str => {
					expect(str).to.equal("string");
				})
				.then(done, done);
		});
	});
});
