import { expect } from "chai";

import buildDataSys from "kitsune/systems/data";
import { createIds } from "kitsune/util";

let dataSys = buildDataSys();

describe("kitsune/systems/data", function() {

	describe("put(node, data)", function() {
		it('inserts \"data\" into the system, indexed by \"node\"', function() {
			var [ nodeA, nodeB ] = createIds(2);

			dataSys.put(nodeA, 123);
			dataSys.put(nodeB, "Hello World");

			var valueA = dataSys.get(nodeA);
			var valueB = dataSys.get(nodeB);

			expect(valueA).to.equal(123);
			expect(valueB).to.equal("Hello World");
		});
	});

	describe("get(node)", function() {
		it("returns data indexed by \"node\"", function() {
			// noop
		});
	});
});
