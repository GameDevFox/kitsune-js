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

	let { nodeSys, edgeSys, stringSys, typeSys, nameSys } = systems;

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	// node service
	// TODO - Organize these under another path
	// Such as "/types/:typeName"
	app.get("/nodes", sendP((req, res) => nodeSys.search(req.query)));
		app.get("/nodes/:id/types", sendP((req, res) => typeSys.getTypes(req.params.id)));
		app.get("/nodes/:id/tails", sendP((req, res) => edgeSys.getTails(req.params.id)));
		app.get("/nodes/:id/heads", sendP((req, res) => edgeSys.getHeads(req.params.id)));
		app.get("/nodes/:id/names", sendP((req, res) => nameSys.getNames(req.params.id)));

	// point service - pretty simple
	app.get("/points", sendP((req, res) => nodeSys.points()));

	// edge service
	app.get("/edges", sendP((req, res) => edgeSys.search(req.query)));
		app.get("/edges/:id", sendP((req, res) => edgeSys.get(req.params.id)));
		app.post("/edges", sendP((req, res) => edgeSys.relate(req.body.head, req.body.tail)));
		app.delete("/edges/:id", sendP((req, res) => edgeSys.del(req.params.id)));

	// misc core services
	app.get("/tails", sendP((req, res) => nodeSys.tails()));
	app.get("/heads", sendP((req, res) => nodeSys.heads()));

	// string service
	app.get("/strings", sendP((req, res) => stringSys.search(req.query)));
		app.get("/strings/:id", sendP((req, res) => stringSys.get(req.params.id)));
		app.post("/strings", sendP((req, res) => stringSys.put(req.body)));
		app.delete("/strings/:id", sendP((req, res) => stringSys.del(req.params.id)));

	// start service
	app.listen(8081);
});
