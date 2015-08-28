import { outFn } from "katana/func";
import * as pipes from "katana/pipes";
import { buildPoint } from "katana/point";

import { Server as WebSocketServer } from "ws";

var server = {};

var buildSocketPipe = function(socket) {
	var socketMsgPipe = outFn(function(data) {
		socket.send(data);
	});
	socket.on("message", function(data, flags) {

		var dataObj = JSON.parse(data);
		var out = buildPoint(dataObj);
		out.socket = socketMsgPipe;
		out.flags = flags;

		socketMsgPipe.out()(out);
	});
	return socketMsgPipe;
};
server.buildSocketPipe = buildSocketPipe;

var buildServerPipe = function(opts) {
	var socketPipe = pipes.pipe();

	var server = new WebSocketServer(opts);
	server.on("connection", function(socket) {
		var dataPipe = buildSocketPipe(socket);
		socketPipe(dataPipe);
	});

	return socketPipe;
};
server.buildServerPipe = buildServerPipe;

module.exports = server;
