import _ from "lodash";

// Load core ids
export var ids = {
	// table ids
	node: "1df43bddb068c88a5d38a0b6819261f3b1454977",
	table: "4940fef3ec048c3ff34151fbb7d842eb51c159cc",
	relationship: "ca0768dab03eb0523568e066f333a7d82e75cf27",
	string: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04",

	// relationship ids
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0"
}

export default function buildDB(sqliteDB) {
	var newDB = {};

	newDB.createNode = function(type) {
		return new Promise(function(resolve, reject) {
			if(!type)
				type = core.node;

			var id = createId();
			var insert = "INSERT INTO t" + core.node + " (id, type) VALUES (?, ?);";

			db.run(insert, id, type, function(err) {
				if(err)
					reject(err);

				resolve(id);
			});
		});
	};

	return newDB;
}

export function createNodes(count, type) {
	var promises = [];
	for(var i=0; i<count; i++) {
		promises.push(createNode(type));
	}
	return Promise.all(promises);
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
	return new Promise(function(resolve, reject) {
		createNode(type)
			.then(function(id) {
				var idData = _.extend(data, { id: id });

				var keys = getKeyStr(idData);
				var values = getValueStr(idData);
				var params = getParamObj(idData);

				var query = "INSERT INTO t" + type + " (" + keys + ") VALUES (" + values + ");";
				db.run(query, params, function(err) {
					if(err)
						reject(err);

					resolve(id);
				});
		});
	});
}

export function getType(id) {
	return new Promise(function(resolve, reject) {
		db.get("SELECT type FROM t" + core.node + " WHERE id = ?;", id, function(err, row) {
			if(err)
				reject(err);

			var result = row ? row.type : null;
			resolve(result);
		});
	});
}

export function relate(head, tail, type) {

	if(_.isArray(tail)) {
		var promises = _.map(tail, function(thisTail) {
			return relate(head, thisTail, type);
		});
		return Promise.all(promises);
	}

	if(!type)
		type = core.relationship;

	return new Promise(function(resolve, reject) {
		createNode(core.relationship)
			.then(function(id) {
				var query = "INSERT INTO t" + core.relationship + " (id, head, tail, type) VALUES (?, ?, ?, ?)";
				db.run(query, [id, head, tail, type], function(err) {
					if(err)
						reject(err);

					resolve(id);
				});
			});
	});
}

export function otherNode(node, rel) {
	if(rel.head == node)
		return rel.tail;
	else if(rel.tail == node)
		return rel.head;
	else
		throw new Error("node \"" + node + "\" is not part of this relationship");
}

// TODO: Consider making a more dynamic "find()" function instead of this
export function rels(node, type, dir="both") {
	return new Promise(function(resolve, reject) {

		var where;
		var params = [node];
		switch(dir) {
		case "both":
			where = "(head = ? OR tail = ?)";
			params.push(node);
			break;
		case "head":
			where = "head = ?";
			break;
		case "tail":
			where = "tail = ?";
			break;
		default:
			throw new Error("\"dir\" must be one of [both DEFAULT, head, tail]");
		}

		var query = "SELECT * FROM t" + core.relationship + " WHERE " + where;

		if(type) {
			query += " AND type = ?";
			params.push(type);
		}

		db.all(query, params, function(err, rows) {
			if(err)
				reject(err);

			resolve(rows);
		});
	});
}

export function nameNode(node, nameStr) {
	return create(core.string, { string: nameStr })
		.then(function(stringNode) {
			return relate(node, stringNode, core.name);
		});
}

export function getNames(node) {
	return new Promise(function(resolve, reject) {
		var query = "SELECT s.* FROM t" + core.string + " s JOIN t" + core.relationship + " r ON r.tail = s.id WHERE r.head = ?";
		db.all(query, [node], function(err, rows) {
			if(err)
				reject(err);

			resolve(rows);
		});
	});
}

export function byName(nameStr) {
	return new Promise(function(resolve, reject) {
		var query = "SELECT * FROM t" + core.relationship + " r JOIN t" + core.string + " s ON s.id = r.tail WHERE s.string = ?";
		db.all(query, [nameStr], function(err, rows) {
			if(err)
				reject(err);

			var nodes = _.pluck(rows, "head");
			resolve(nodes);
		});
	});
}

export function one(arr) {
	return new Promise(function(resolve, reject) {
		if(arr.length == 1)
			resolve(arr[0]);
		else
			reject(arr);
	});
}
