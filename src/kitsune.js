import _ from "lodash";

import * as system from "katana/system";
import server from "./sockets";

// TODO: Make something like this
// buildType().has("command", String).maybe("data", [Array,

var isCommand = function(data) {
	var is = _.has(data(), "$command");
	is &= typeof data().$command == "string";
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

var buildKSys = function() {
	var handlers = {};
	var kSys = function(data) {

		var cmdName = data().$command;
		system.log("Command: " + cmdName);

		var handler = handlers[cmdName];
		handler(data);
	};
	kSys.command = function(cmdName, func) {
		handlers[cmdName] = func;
	};
	return kSys;
};

var kSys = buildKSys();
kSys.command("version", function(data) {
	data.socket("1.0.0");
});

var handleData = function(data) {
	system.log(data());

	buildSwitch([
		{ type: isCommand, func: kSys }
	], function defaultFn(data) {
		system.log("Message was invalid:");
		system.log(data());
	})(data);
};

var handleSocket = function(socket) {
	system.log("Client connected");
	socket.out(handleData);

	socket("Hello Client!");
};

var start = function() {
	var serverInst = server.buildServerPipe({ port: 8081 });
	serverInst.out(handleSocket);
	return serverInst;
};

export default start;
