/* COMMAND OBJECTS */
	exports.commands = {
		"ping" : {
			description: "Responds to ping",
			use: "<prefix>ping",
			check: async function(bot, backend, message, channel, server){
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				return;
			},
			response: async function(bot, backend, message, channel, server){
				return "Pong";
			},
			defaultPermLevel: 1,
			possibleLengths: [1]
		},
		"trello" : {
			description: "Posts the Trello development board",
			use: "<prefix>trello",
			check: async function(bot, backend, message, channel, server){
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				return;
			},
			response: async function(bot, backend, message, channel, server){
				return "https://trello.com/b/rwz2I6KE/ghostbot";
			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		},
		"enable" : {
			description: "Enables the specified module for the current server",
			use: "<prefix>enable <module>",
			check: async function(bot, backend, message, channel, server){
				if (!Object.keys(backend.modules).includes(message.split[1])) return {name: "OtherError", message: `Could not find module \`${message.split[1]}\``};
				if (backend.modules[message.split[1]] && backend.modules.isEnabled(server, message.split[1])) return {name: "OtherError", message: `\`${message.split[1]}\` module already enabled.`};
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				backend.modules.enable(message.split[1]);
			},
			response: async function(bot, backend, message, channel, server){
				return `${message.split[1]} enabled.`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"disable" : {
			description: "Disables the specified module for the current server",
			use: "<prefix>disable <module>",
			check: async function(bot, backend, message, channel, server){
				if (!Object.keys(server.modules).includes(message.split[1])) return {name: "OtherError", message: `Could not find module \`${message.split[1]}\``};
				if (!server.modules[message.split[1]].enabled) return {name: "OtherError", message: `\`${message.split[1]}\` module already disabled.`};
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				server.modules[message.split[1]].enabled = false;
			},
			response: async function(bot, backend, message, channel, server){
				return `${message.split[1]} disabled.`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"initialize" : {
			description: "Marks the server as active",
			use: "<prefix>initialize",
			check: async function(bot, backend, message, channel, server){
				if (server.isInitialized) return {name: "OtherError", message: "Server is already initialized!"};
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				console.log("doing the thing");
				server.initialize();
			},
			response: async function(bot, backend, message, channel, server){
				return "Server initialized";
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
		"use" : {
			description: "Describes the use of the specified command. <> indicates a variable to be replaced, [] indicates a choice, and {} indicates optional inputs.",
			use: "<prefix>use <command>",
			check: async function(bot, backend, message, channel, server){
				if (server.checkCommand(message.split[1]).name) return {name: "CommandError", message: `\`${message.split[1]}\` not found`};
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				return;
			},
			response: async function(bot, backend, message, channel, server){
				return `\`${server.checkCommand(message.split[1]).use}\``;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"description" : {
			description: "Describes the specified command.",
			use: "<prefix>use <command>",
			aliases: ["describe", "define", "definition"],
			check: async function(bot, backend, message, channel, server){
				if (server.checkCommand(message.split[1]).name) return {name: "CommandError", message: `\`${message.split[1]}\` not found`};
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				return;
			},
			response: async function(bot, backend, message, channel, server){
				return `\`${server.checkCommand(message.split[1]).description}\``;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"setprefix" : {
			description: "Sets the prefix the bot uses for parsing commands.",
			use: "<prefix>setprefix <newprefix>",
			check: async function(bot, backend, message, channel, server){
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				backend.Server.Prefix.set(server, message.split[1]);
				return;
			},
			response: async function(bot, backend, message, channel, server){
				return `This server's prefix is now ${server.prefix}`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"refreshserver" : {
			description: "Completely rebuilds the server, allowing for new features to be enabled",
			use: "<prefix>refreshserver",
			check: async function(bot, backend, message, channel, server){
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				backend.Server.refresh();

				return;
			},
			response: async function(bot, backend, message, channel, server){
				return `Server is now refreshed.`;
			},
			defaultPermLevel: 4,
			possibleLengths: [1]
		},
		"viewserver" : {
			description: "Outputs server in object form",
			use: "<prefix>viewserver",
			check: async function(bot, backend, message, channel, server){
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
				const serverObj = backend.Server.JSON(server);
				message.channel.send(`\`\`\`\n ${JSON.stringify(serverObj.modules)}\n\`\`\``)
				return;
			},
			response: async function(bot, backend, message, channel, server){
				return;
			},
			defaultPermLevel: 4,
			possibleLengths: [1]
		},
	}

	for (let command in exports.commands){
		if (exports.commands[command].aliases){
			for (let n in exports.commands[command].aliases){
				exports.commands[exports.commands[command].aliases[n]] = exports.commands[command];
				exports.commands[exports.commands[command].aliases[n]].use = `<prefix>${exports.commands[command].aliases[n]}`;
			}
		}
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: async function(bot, backend, message, channel, server){
				return "Success";
			},
			exec: async function(bot, backend, message, channel, server){
			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/