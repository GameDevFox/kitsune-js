import crypto from "crypto";
import _ from "lodash";

export function createId() {
	var id = crypto.createHash("sha1").update(Math.random().toString()).digest("hex");
	return id;
}

export function createIds(count) {
	var result = [];

	for(var i=0; i<count; i++)
		result.push(createId());

	return result;
}

export function getSqlQMarks(count) {
	var result = "";
	for(var i=0; i<count; i++) {
		result += "?";
		if(i<count-1)
			result += ", ";
	}
	return result;
}

export function one(arr) {
	return new Promise(function(resolve, reject) {
		if(arr.length == 1)
			resolve(arr[0]);
		else
			reject(arr);
	});
}

export function logP(msg="") {
	return function(value) {
		console.log(msg+" ===============");
		console.log(value);
		console.log("===================");
		return value;
	}
}
