var expect = require("chai").expect;
var sinon = require("sinon");

var system = require("kitsune/system");

describe("kitsune/system", function() {

	describe("version(data)", function() {
		it("should return the version", function() {
			var spy = sinon.spy();
			var dataMock = { socket: spy };

			var ver = system.version(dataMock);

			expect(spy.calledOnce).to.equal(true);
			expect(spy.lastCall.args).to.deep.equal(["1.0.0"]);
		});
	});
});
