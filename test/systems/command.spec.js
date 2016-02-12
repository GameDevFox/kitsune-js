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
					let func = eval(code);
					var result = func();
					expect(result).to.equal(123);
				})
				.then(done, done);

			// Random number between x and y
			// ============================
			// (x, y) => {
			// 	let rand = Math.random();
			// 	let range = y - x;

			// 	console.log(range);
			// 	rand = rand * range;
			// 	rand = rand + x;
			// 	return rand;
			// }

			// Deps
			// ==========================
			// x
			// y
			// Math.random
			// console.log
			// - (minus operator)
			// * (multiply operator)
			// + (plus operator)

			// Generated code
			// =========================
			// let v1 = f12387348297239();
			// let v2 = f83748372438324(p1, p2); // subtract
			// f34283749283423(v2);
			// v1 = f45837593487543(v1. v2); // multiply
			// v1 = f43587345943875(v1, p1); // add
			// return v1;
		});
	});
});
