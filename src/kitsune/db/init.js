#!/usr/bin/env node

import { ids } from "index";

export function init() {
	createTable(core, "id TEXT", "name TEXT")
		.then(createTable(core.node, "is TEXT PRIMARY KEY", "type TEXT"));
}
