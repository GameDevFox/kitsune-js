let crypto = require("crypto");

function hashString(string) {
    let result = crypto.createHash("sha1").update(string).digest("hex");
	return result;
}
module.exports = hashString;
