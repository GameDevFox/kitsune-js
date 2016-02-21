import { expect } from "chai";

import ids from "kitsune/ids";
import getDB from "kitsune/systems/db/cache";
import { createId, createIds, one, logP } from "kitsune/util";

let sqliteDB = getDB();

let nameSys, mapSys, stringSys;
before((done) => sqliteDB.initP
	   .then(systems => {
		   nameSys = systems.nameSys;
		   mapSys = systems.mapSys;
		   stringSys = systems.stringSys;
	   })
	   .then(() => done(), done));

describe("kitsune/command", function() {

	describe("do(commandId)", function() {
		it("executes the given command", function(done) {
			nameSys.getNodes("test")
				.then(one)
				.then(node => mapSys.get(node, ids.functionCode))
				.then(one)
				.then(codeId => stringSys.get(codeId))
				.then(code => {
					/* jshint evil: true */
					let func = new Function("a", code);
					var result = func({ x:100, y:23 });
					expect(result).to.equal(123);
				})
				.then(done, done);
		});
	});
});
