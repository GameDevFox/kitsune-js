var func = require("katana/func");
var pipes = require("katana/pipes");

var WebSocketServer = require("ws").Server;

var server = {};

var buildSocketPipe = function(socket) {
	var socketMessagePipe = func.fo(function(data) {
		socket.send(data);
	});
	socket.on("message", function(data, flags) {

		var out = {
			socket: socketMessagePipe,
			data: data,
			flags: flags
		};

		socketMessagePipe.out()(out);
	});
	return socketMessagePipe;
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
