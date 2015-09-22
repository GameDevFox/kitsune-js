import crypto from "crypto";

export function createId() {
	var id = crypto.createHash("sha1").update(Math.random().toString()).digest("hex");
	return id;
}
