import bodyParser from "body-parser";
import express from "express";
import sqlite3 from "sqlite3";

import getDB from "kitsune/db/cache";
import ids from "kitsune/ids";

let sqliteDB = getDB();
let app = express.createServer();

app.configure(() => {
	app.use(bodyParser.text());
	app.use(bodyParser.json());
});

function sendP(func) {
	return (req, res) => {
		func(req, res)
			.then(result => res.send(result))
			.catch(e => {
				console.log(e);
			});
	};
}

sqliteDB.initP.then(systems => {

	let { relSys, stringSys, idSys } = systems;

	// id service
	app.get("/ids", sendP((req, res) => idSys.all()));
	app.get("/heads", sendP((req, res) => idSys.heads()));
	app.get("/tails", sendP((req, res) => idSys.tails()));

	// rel service
	app.get("/rels", sendP((req, res) => relSys.search(req.query)));
	app.get("/rels/:id", sendP((req, res) => relSys.get(req.params.id)));
	app.post("/rels", sendP((req, res) => relSys.relate(req.body.head, req.body.tail)));
	app.delete("/rels/:id", sendP((req, res) => relSys.del(req.params.id)));

	// string service
	app.get("/strings", sendP((req, res) => stringSys.search(req.query)));
	app.get("/strings/:id", sendP((req, res) => stringSys.get(req.params.id)));
	app.post("/strings", sendP((req, res) => stringSys.put(req.body)));
	app.delete("/strings/:id", sendP((req, res) => stringSys.del(req.params.id)));

	// start service
	app.listen(8081);
});
