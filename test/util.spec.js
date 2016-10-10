let expect = require("chai").expect;

let util = require("kitsune/util");

describe("kitsune/util", function() {
	describe("one(array)", function() {
		it("resolves if the array has only one element", function(done) {
			util.one([1])
				.then(function(one) {
					expect(one).to.equal(1);
				})
				.then(done, done);
		});

		it("rejects if the array is empty", function(done) {
			util.one([])
				.then(function(one) {
					throw new Error("one() should not resolve on empty array");
				})
				.catch(function(e) {
					expect(e).to.deep.equal([]);
				})
				.then(done, done);
		});

		it("rejects if the array has more than one element", function(done) {
			util.one([1, 2, 3])
				.then(function(one) {
					throw new Error("one() should not resolve on empty array");
				})
				.catch(function(e) {
					expect(e).to.deep.equal([1, 2, 3]);
				})
				.then(done, done);
		});
	});
});
