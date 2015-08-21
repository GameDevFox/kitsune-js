import _ from "lodash";

import * as sys from "katana/system";
import * as ksystem from "./system";
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

var processCommand = function(data) {

	var cmdName = data().$command;
	sys.log("Command: " + cmdName);

	var handler = ksystem[cmdName];
	if(!handler) {
		var errorMsg = "Invalid command: "+cmdName;
		console.error(errorMsg);
		data.socket({ $error: errorMsg });
		return;
	}

	handler(data);
};

var handleData = function(data) {
	sys.log(data());

	buildSwitch([
		{ type: isCommand, func: processCommand }
	], function defaultFn(data) {
		sys.log("Message was invalid:");
		sys.log(data());
	})(data);
};

var handleSocket = function(socket) {
	sys.log("Client connected");
	socket.out(handleData);

	socket("Hello Client!");
};

var start = function() {
	var serverInst = server.buildServerPipe({ port: 8081 });
	serverInst.out(handleSocket);
	return serverInst;
};

export default start;
