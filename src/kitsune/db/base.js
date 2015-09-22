export default function buildBase(sqliteDB) {

	var base = {};

	var createTable = function(name, ...cols) {
		return new Promise(function(resolve, reject) {
			var query = "CREATE TABLE " + name + "(";
			query += cols.join(", ");
			query += ");";

			sqliteDB.run(query, function(err) {
				if(err)
					reject(err);

				resolve(name);
			});
		});
	};
	base.createTable = createTable;

	return base;
}
