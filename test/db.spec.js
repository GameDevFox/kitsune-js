import * as db from "../db.js";
import { expect } from "chai";

describe("db.create()", function() {
	it("should save a node with it's type and data", function(done) {

		db.create(db.core.string, { string: "Super power" }, function(id) {
			db.getType(id, function(type) {
				expect(type).to.equal(db.core.string);
				done();
			});
		});
	});
});
