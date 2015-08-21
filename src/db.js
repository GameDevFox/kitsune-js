import _ from "lodash";
import sqlite3 from "sqlite3";

var db = new sqlite3.Database("data/data.db");

function createDataType(type, cb) {
	db.serialize(function() {
		var idQuery = "SELECT random() as id;";
		db.get(idQuery, function(err, idResult) {
			var id = idResult.id;
			var insert = "INSERT INTO dataType (id, dataType) VALUES (?, ?);";
			db.get(insert, id, type);

			cb(id);
		});
	});
}

function create(type, data, cb) {
	db.serialize(function() {
		var keys = _.keys(data).join(", ");
		_({ hello: "World", age: 13 }).values().map(function(value) {
			return typeof value == "string" ? "\"" + value + "\"" : value;
		}).run().join(", ");

		// TODO: Use "?" in the query
		var query = "INSERT INTO " + type + " (" + keys + ") VALUES (" + values + ");";
		console.log(query);
		db.run(query, cb);
	});
}

function getType(id, cb) {
	db.serialize(function() {
		db.get("SELECT dataType FROM dataType WHERE id = ?;", id, function(err, row) {
			var result = row ? row.dataType : null;
			cb(result);
		});
	});
}

getType(456, function(type) {
	console.log("Type: "+type);
});
getType(123213, function(type) {
	console.log("Type: "+type);
});
