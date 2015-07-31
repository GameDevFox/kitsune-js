var func = require("katana/func");
var pipes = require("katana/pipes");

var WebSocketServer = require("ws").Server;

var server = {};

var buildWebSocketPipe = function(socket) {
	var dataPipe = func.fo(function(data) {
		socket.send(data);
	});
	socket.on("message", function(data) {
		dataPipe.out()(data);
	});
	return dataPipe;
};
server.buildWebSocketPipe = buildWebSocketPipe;

var buildWebSocketServerPipe = function(opts) {
	var socketPipe = pipes.pipe();

	var server = new WebSocketServer(opts);
	server.on("connection", function(socket) {
		var dataPipe = buildWebSocketPipe(socket);
		socketPipe(dataPipe);
	});

	return socketPipe;
};
server.buildWebSocketServerPipe = buildWebSocketServerPipe;

module.exports = server;
