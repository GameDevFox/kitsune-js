import _ from "lodash";

import * as util from "./util";

// Load core ids
export var tables = {
	relationship: "ca0768dab03eb0523568e066f333a7d82e75cf27",
};

export var ids = _.extend({
	// relationship ids
	name: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0"
}, tables);

// Module functions
export function relate(db, head, ...tails) {

	if(tails.length > 1) {
		var promises = _.map(tails, (thisTail) => {
			return relate(db, head, thisTail);
		});
		return Promise.all(promises);
	}

	var id = util.createId();
	var tail = tails[0];

	var query = `INSERT INTO t${ids.relationship} (id, head, tail) VALUES (?, ?, ?)`;
	return runP(db, query, [id, head, tail])
		.then(() => id);
};

export function getRel(db, id) {
	var query = `SELECT * FROM t${ids.relationship} WHERE id = ?;`;
	return getP(db, query, id);
};

// helper functions
var dbOpTemplate = function(opName, db, query, args) {
	return new Promise((resolve, reject) => {
		db[opName](query, args, (err, result) => {
			if(err)
				reject(err);

			if(result)
				resolve(result);
			else
				resolve();
		});
	});
};

var runP = dbOpTemplate.bind(this, "run");
var getP = dbOpTemplate.bind(this, "get");

// default export
export default function buildDB(db) {
	return {
		relate: relate.bind(this, db),
		getRel: getRel.bind(this, db)
	};
}
