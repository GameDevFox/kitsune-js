import * as db from "kitsune/db";
import { expect } from "chai";

describe("kitsune/db", function() {

	describe("createNode(type)", function() {
		it("should create a \"type\" node", function(done) {
			db.createNode(db.core.node)
				.then(function(id) {
					expect(id).to.not.equal(null);
				})
				.then(done, done);
		});

		it("should create a generic node by default (no args)", function(done) {
			db.createNode()
				.then(db.getType)
				.then(function(type) {
					expect(type).to.equal(db.core.node);
				})
				.then(done, done);
		});
	});

	describe("create(type, data)", function() {
		it("should save a node with it's type and data", function(done) {

			db.create(db.core.string, { string: "Super power" })
				.then(db.getType)
				.then(function(type) {
					expect(type).to.equal(db.core.string);
				})
				.then(done, done);

		});
	});

	describe("relate(head, tail)", function() {
		it("should create a generic relationship between two nodes", function(done) {

			var nodeA;
			Promise.all([
				db.createNode(db.core.node),
				db.createNode(db.core.node)
			])
				.then(db.relate)
				.then(function(id) {
					expect(id).to.not.equal(null);
				})
				.then(done, done);
		});
	});
});
