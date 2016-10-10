let crypto = require("crypto");

export function hash(str) {
	let result = crypto.createHash("sha1").update(str).digest("hex");
	return result;
}

export function createId() {
	let id = hash(Math.random().toString());
	return id;
}

export function createIds(count) {
	var result = [];

	for(var i=0; i<count; i++)
		result.push(createId());

	return result;
}

// TODO: Consider moving below functions to "util/promise.js"

// TODO: Rename this to "oneP" and create a generic "one" function
export function one(arr) {
	return new Promise(function(resolve, reject) {
		if(arr.length == 1)
			resolve(arr[0]);
		else
			reject(arr);
	});
}

export function logP(msg=null, border=false) {
	return function(value) {
		if(msg) {
			if(!border) {
				console.log(msg+": "+value);
				return;
			}

			console.log("===================");
			console.log(" "+msg+": ");
		}

		if(border)
			console.log(msg ? "-------------------" : "===================");

		console.log(value);

		if(border)
			console.log("===================");
		return value;
	};
}
