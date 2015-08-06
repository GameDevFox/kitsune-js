#!/usr/bin/env node
var _ = require("lodash");

var system = require("katana/system");
var server = require("./src/sockets");

// TODO: Make something like this
// buildType().has("command", String).maybe("data", [Array,

var isCommand = function(data) {
	var is = _.has(data, "command");
	is &= typeof data.command == "string";
	if(_.has("data"))
		is &= typeof data.data == "object";

	return is;
};

var buildSwitch = function(outputs, defaultFn) {

	return function(input) {
		var foundOutput = false;

		_.each(outputs, function(output) {

			var type = output.type;
			if(type(input)) {
				foundOutput = true;

				var func = output.func;
				func(input);
			}
		});

		if(!foundOutput && defaultFn)
			defaultFn(input);
	};
};

var handleCommand = function(message) {

	var commandName = message.data.command;

	console.log("Command: ");
	console.log(commandName);

	switch(commandName) {
	case "version":
		message.socket("1.0.0");
			break;
	}
};

var handleData = function(message) {
	var data = JSON.parse(message.data);
	system.out(data);
	var isValid = isCommand(data) ? "yes" : "no";
	var msg = "Is Valid: " + isValid;
	system.out(msg);

	var socket = message.socket;
	socket(msg);

	buildSwitch([
		{ type: isCommand, func: handleCommand }
	], function defaultFn(data) {
		console.log("Message was invalid:");
		console.log(data);
	})(message);
};

var handleSocket = function(socket) {
	console.log("Client connected");
	socket.out(handleData);

	socket("Hello Client!");
};

var start = function() {
	var serverInst = server.buildServerPipe({ port: 8081 });
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
