#!/usr/bin/env node
var _ = require("lodash");

var system = require("katana/system");
var server = require("./server");

// TODO: Make something like this
// buildType().has("command", String).maybe("data", [Array,

var isCommand = function(data) {
	var is = _.has(data, "command");
	is &= typeof data.command == "string";
	if(_.has("data"))
		is &= typeof data.data == "object";

	return is;
};

var swytch = function(input, outputs) {
	_.each(outputs, function() {
		// TODO: this
	});
};

var handleData = function(dataStr) {
	var data = JSON.parse(dataStr);
	system.out(data);

	// FIXME: This is broken, should return "no" right now
	system.out("Is Valid: " + (isCommand(data) ? "yes" : "no"));
/*
	dataSwitch(data, [
		[ command, handleCommand ],
		[ badData ]
	]);
*/
};

var handleSocket = function(socket) {
	console.log("Client connected");
	socket.out(handleData);

	socket("Hello Client!");
};

var start = function() {
	var serverInst = server.buildWebSocketServerPipe({ port: 8081 });
	serverInst.out(handleSocket);
	return serverInst;
};
server.start = start;

if(module.parent) {
	// Child
	module.exports = server;
} else {
	// Parent
	start();
}
