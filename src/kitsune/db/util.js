import crypto from "crypto";
import _ from "lodash";

export function createId() {
	var id = crypto.createHash("sha1").update(Math.random().toString()).digest("hex");
	return id;
}

export function getKeyStr(data) {
	var keyStr = _.keys(data).join(", ");
	return keyStr;
}

export function getValueStr(data) {
	var valueStr = _(data).keys().map(function(value) {
		return "$"+value;
	}).run().join(", ");
	return valueStr;
}

export function getParamObj(data) {
	var paramObj = {};
	_.each(data, function(value, key) {
		paramObj["$"+key] = value;
	});
	return paramObj;
}

export function otherNode(node, rel) {
	if(rel.head == node)
		return rel.tail;
	else if(rel.tail == node)
		return rel.head;
	else
		throw new Error("node \"" + node + "\" is not part of this relationship");
}

export function one(arr) {
	return new Promise(function(resolve, reject) {
		if(arr.length == 1)
			resolve(arr[0]);
		else
			reject(arr);
	});
}
