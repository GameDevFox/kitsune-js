export function createTable(name, ...cols) {
	return new Promise(function(resolve, reject) {
		var query = "CREATE TABLE " + name + "(";
		query += cols.join(", ");
		query += ");";
		log.query(query);
		db.run(query, function(err) {
			if(err)
				reject(err);

			resolve(name);
		});
	});
}
