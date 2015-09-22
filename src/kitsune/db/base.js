export default function buildBase(sqliteDB) {

	var base = {};

	var create = function(name, ...cols) {
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
	};
	base.create = create;

	var alias = function(tableId, alias) {
		return new Promise(function(resolve, reject) {
			var query = `CREATE VIEW "${alias}" AS SELECT * FROM t${tableId};`;
			sqliteDB.run(query, function(err) {
				if(err)
					reject(err);

				resolve(alias);
			});
		});
	};
	base.alias = alias;

	return base;
}
