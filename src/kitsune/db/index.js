function dbQuery(opName, db, query, ...args) {
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
}

export function runP(db, query, ...args) {
	return dbQuery("run", db, query, ...args);
}

export function getP(db, query, ...args) {
	return dbQuery("get", db, query, ...args);
}

export function allP(db, query, ...args) {
	return dbQuery("all", db, query, ...args);
}


export function create(db, name, ...cols) {
	var query = "CREATE TABLE " + name + " (" + cols.join(", ") + ");";
	return runP(db, query);
}

export function view(db, name, viewSql) {
	var query = `CREATE VIEW "${name}" AS ${viewSql};`;
	return runP(db, query);
}

export function alias(db, table, name) {
	var subQuery = `SELECT * FROM ${table};`;
	return view(db, name, subQuery);
}

export default function bind(sqliteDB) {
	return {
		runP: runP.bind(this, sqliteDB),
		getP: getP.bind(this, sqliteDB),
		allP: allP.bind(this, sqliteDB),

		alias: alias.bind(this, sqliteDB),
		create: create.bind(this, sqliteDB),
		view: view.bind(this, sqliteDB)
	};
}
