import _ from "lodash";

import * as util from "./util";

// Load core ids
export var tables = {
	node: "1df43bddb068c88a5d38a0b6819261f3b1454977",
	table: "4940fef3ec048c3ff34151fbb7d842eb51c159cc",
	relationship: "ca0768dab03eb0523568e066f333a7d82e75cf27",
	string: "4fe868cd3e83b53a04b346b546bc6e1b5e32ad04"
};

export var ids = _.extend(tables, {
	// relationship ids
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0"
});

export default function buildDB(sqliteDB) {
	var db = {};

	var createNode = function(type) {
		return new Promise(function(resolve, reject) {
			if(!type)
				type = ids.node;

			var id = util.createId();
			var insert = "INSERT INTO t" + ids.node + " (id, type) VALUES (?, ?);";

			sqliteDB.run(insert, id, type, function(err) {
				if(err)
					reject(err);

				resolve(id);
			});
		});
	};
	db.createNode = createNode;

	var createNodes = function(count, type) {
		return new Promise(function(resolve, reject) {
			if(!type)
				type = ids.node;

			var nodeIds = [];
			var args = [];
			var valuesClause = "";
			for(var i=0; i<count; i++) {
				var id = util.createId();
				nodeIds.push(id);
				args.push(id, type);
				valuesClause += "(?, ?)";
				if(i < count-1)
					valuesClause += ", ";
			}

			var insert = "INSERT INTO t" + ids.node + " (id, type) VALUES " + valuesClause + ";";

			sqliteDB.run(insert, args, function(err) {
				if(err)
					reject(err);

				resolve(nodeIds);
			});
		});
	};
	db.createNodes = createNodes;

	var getType = function(id) {
		return new Promise(function(resolve, reject) {
			sqliteDB.get("SELECT type FROM t" + ids.node + " WHERE id = ?;", id, function(err, row) {
				if(err)
					reject(err);

				var result = row ? row.type : null;
				resolve(result);
			});
		});
	};
	db.getType = getType;

	var create = function(type, data, cb) {
		return new Promise(function(resolve, reject) {
			createNode(type)
				.then(function(id) {
					var idData = _.extend(data, { id: id });

					var keys = util.getKeyStr(idData);
					var values = util.getValueStr(idData);
					var params = util.getParamObj(idData);
					var query = "INSERT INTO t" + type + " (" + keys + ") VALUES (" + values + ");";
					sqliteDB.run(query, params, function(err) {
						if(err)
							reject(err);

						resolve(id);
					});
				});
		});
	};
	db.create = create;

	var relate = function(head, tail, type) {

		if(_.isArray(tail)) {
			var promises = _.map(tail, function(thisTail) {
				return relate(head, thisTail, type);
			});
			return Promise.all(promises);
		}

		if(!type)
			type = ids.relationship;

		return new Promise(function(resolve, reject) {
			createNode(ids.relationship)
				.then(function(id) {
					var query = "INSERT INTO t" + ids.relationship + " (id, head, tail, type) VALUES (?, ?, ?, ?)";
					sqliteDB.run(query, [id, head, tail, type], function(err) {
						if(err)
							reject(err);

						resolve(id);
					});
				});
		});
	};
	db.relate = relate;
	// TODO: Consider making a more dynamic "find()" function instead of this
	var rels = function(node, type, dir="both") {
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

			var query = "SELECT * FROM t" + ids.relationship + " WHERE " + where;

			if(type) {
				query += " AND type = ?";
				params.push(type);
			}

			sqliteDB.all(query, params, function(err, rows) {
				if(err)
					reject(err);

				resolve(rows);
			});
		});
	};
	db.rels = rels;

	var nameNode = function(node, nameStr) {
		return create(ids.string, { string: nameStr })
			.then(function(stringNode) {
				return relate(node, stringNode, ids.name);
			});
	};
	db.nameNode = nameNode;

	var getNames = function(node) {
		return new Promise(function(resolve, reject) {
			var query = "SELECT s.* FROM t" + ids.string + " s JOIN t" + ids.relationship + " r ON r.tail = s.id WHERE r.head = ?";
			sqliteDB.all(query, [node], function(err, rows) {
				if(err)
					reject(err);

				resolve(rows);
			});
		});
	};
	db.getNames = getNames;

	var byName = function(nameStr) {
		return new Promise(function(resolve, reject) {
			var query = "SELECT * FROM t" + ids.relationship + " r JOIN t" + ids.string + " s ON s.id = r.tail WHERE s.string = ?";
			sqliteDB.all(query, [nameStr], function(err, rows) {
				if(err)
					reject(err);

				var nodes = _.pluck(rows, "head");
				resolve(nodes);
			});
		});
	};
	db.byName = byName;

	return db;
}
