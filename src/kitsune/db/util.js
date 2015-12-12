import _ from "lodash";

export function whereClause(obj) {
	let sql = "";
	let args = [];

	_.each(obj, function(value, name) {
		if(sql.length === 0)
			sql += " WHERE ";
		else
			sql += "AND ";

		sql += `${name} = ? `;
		args.push(value);
	});

	return { sql, args };
}