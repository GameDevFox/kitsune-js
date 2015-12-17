import bodyParser from "body-parser";
import express from "express";
import sqlite3 from "sqlite3";

import getDB from "kitsune/systems/db/cache";
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

	let { idSys, relSys, stringSys, typeSys, nameSys } = systems;

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	// node service
	app.get("/nodes", sendP((req, res) => idSys.all()));
	// TODO - Organize these under another path
	// Such as "/types/:typeName"
	app.get("/points", sendP((req, res) => idSys.points()));
	app.get("/tails", sendP((req, res) => idSys.tails()));
	app.get("/heads", sendP((req, res) => idSys.heads()));

	app.get("/nodes/:id/types", sendP((req, res) => typeSys.getTypes(req.params.id)));
	app.get("/nodes/:id/tails", sendP((req, res) => relSys.getTails(req.params.id)));
	app.get("/nodes/:id/heads", sendP((req, res) => relSys.getHeads(req.params.id)));
	app.get("/nodes/:id/names", sendP((req, res) => nameSys.getNames(req.params.id)));

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
