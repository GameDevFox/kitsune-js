import _ from "lodash";
import crypto from "crypto";
import sqlite3 from "sqlite3";

var db = new sqlite3.Database("data/data.db");

// Load core ids
// TODO: Load th
export var core = {
	node: "1df43bddb068c88a5d38a0b6819261f3b1454977",
	tab: "4940fef3ec048c3ff34151fbb7d842eb51c159cc",
	relationship: "ca0768dab03eb0523568e066f333a7d82e75cf27",
	string: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04"
};

export function createId() {
	var id = crypto.createHash("sha1").update(Math.random().toString()).digest("hex");
	return id;
}

export function createNode(type, cb) {
	if(!type)
		type = core.node;

	var id = createId();
	var insert = "INSERT INTO t" + core.node + " (id, type) VALUES (?, ?);";
	db.run(insert, id, type);

	if(cb)
		cb(id);
}

var getKeyStr = function(data) {
	var keyStr = _.keys(data).join(", ");
	return keyStr;
};

var getValueStr = function(data) {
	var valueStr = _(data).keys().map(function(value) {
		return "$"+value;
	}).run().join(", ");
	return valueStr;
};

var getParamObj = function(data) {
	var paramObj = {};
	_.each(data, function(value, key) {
		paramObj["$"+key] = value;
	});
	return paramObj;
};

export function create(type, data, cb) {
	db.serialize(function() {
		createNode(type, function(id) {
			var idData = _.extend(data, { id: id });

			var keys = getKeyStr(idData);
			var values = getValueStr(idData);
			var params = getParamObj(idData);

			var query = "INSERT INTO t" + type + " (" + keys + ") VALUES (" + values + ");";
			db.run(query, params, function() {
				if(cb)
					cb(id);
			});
		});
	});
}

export function getType(id, cb) {
	db.serialize(function() {
		db.get("SELECT type FROM t" + core.node + " WHERE id = ?;", id, function(err, row) {
			var result = row ? row.type : null;
			cb(result);
		});
	});
}
