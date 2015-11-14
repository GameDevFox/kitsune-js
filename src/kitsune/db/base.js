export function create(sqliteDB, name, ...cols) {
	return new Promise(function(resolve, reject) {
		var query = "CREATE TABLE " + name + " (";
		query += cols.join(", ");
		query += ");";

		sqliteDB.run(query, function(err) {
			if(err)
				reject(err);

			resolve(name);
		});
	});
}

export function view(sqliteDB, name, viewSql) {
	return new Promise(function(resolve, reject) {
		var query = `CREATE VIEW "${name}" AS ${viewSql};`;
		sqliteDB.run(query, function(err) {
			if(err)
				reject(err);

			resolve(name);
		});
	});
}

export function alias(sqliteDB, table, name) {
	var query = `SELECT * FROM ${table};`;
	return view(sqliteDB, name, query);
}

export default function buildBase(sqliteDB) {
	return {
		alias: alias.bind(this, sqliteDB),
		create: create.bind(this, sqliteDB),
		view: view.bind(this, sqliteDB)
	};
}
