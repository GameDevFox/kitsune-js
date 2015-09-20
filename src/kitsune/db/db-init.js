#!/usr/bin/env node
export function init() {
	createTable(core, "id TEXT", "name TEXT")
		.then(createTable(core.node, "is TEXT PRIMARY KEY", "type TEXT"));
}
