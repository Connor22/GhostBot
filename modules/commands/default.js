/* COMMAND OBJECTS */
	const defaultModule = {
		"ping" : {
			description: "Responds to ping",
			use: "<prefix>ping",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				return;
			},
			response: async function(message, channel, server){
				return "Pong";
			},
			defaultPermLevel: 1,
			possibleLengths: [1]
		},
		"trello" : {
			description: "Posts the Trello development board",
			use: "<prefix>trello",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				return;
			},
			response: async function(message, channel, server){
				return "https://trello.com/b/rwz2I6KE/ghostbot";
			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		},
		"enable" : {
			description: "Enables the specified module for the current server",
			use: "<prefix>enable <module>",
			check: async function(message, channel, server){
				if (!Object.keys(server.modules).includes(message.split[1])) return {name: "OtherError", message: `Could not find module \`${message.split[1]}\``};
				if (server.modules[message.split[1]] && server.modules[message.split[1]].enabled) return {name: "OtherError", message: `\`${message.split[1]}\` module already enabled.`};
				return "Success";
			},
			exec: async function(message, channel, server){
				server.modules[message.split[1]].enabled = true;
			},
			response: async function(message, channel, server){
				return `${message.split[1]} enabled.`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"disable" : {
			description: "Disables the specified module for the current server",
			use: "<prefix>disable <module>",
			check: async function(message, channel, server){
				if (!Object.keys(server.modules).includes(message.split[1])) return {name: "OtherError", message: `Could not find module \`${message.split[1]}\``};
				if (!server.modules[message.split[1]].enabled) return {name: "OtherError", message: `\`${message.split[1]}\` module already disabled.`};
				return "Success";
			},
			exec: async function(message, channel, server){
				server.modules[message.split[1]].enabled = false;
			},
			response: async function(message, channel, server){
				return `${message.split[1]} disabled.`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"initialize" : {
			description: "Marks the server as active",
			use: "<prefix>initialize",
			check: async function(message, channel, server){
				if (server.isInitialized) return {name: "OtherError", message: "Server is already initialized!"};
				return "Success";
			},
			exec: async function(message, channel, server){
				console.log("doing the thing");
				server.initialize();
			},
			response: async function(message, channel, server){
				return "Server initialized";
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
		"use" : {
			description: "Describes the use of the specified command. <> indicates a variable to be replaced, [] indicates a choice, and {} indicates optional inputs.",
			use: "<prefix>use <command>",
			check: async function(message, channel, server){
				if (server.checkCommand(message.split[1]).name) return {name: "CommandError", message: `\`${message.split[1]}\` not found`};
				return "Success";
			},
			exec: async function(message, channel, server){
				return;
			},
			response: async function(message, channel, server){
				return `\`${server.checkCommand(message.split[1]).use}\``;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"description" : {
			description: "Describes the specified command.",
			use: "<prefix>use <command>",
			aliases: ["describe", "define", "definition"],
			check: async function(message, channel, server){
				if (server.checkCommand(message.split[1]).name) return {name: "CommandError", message: `\`${message.split[1]}\` not found`};
				return "Success";
			},
			exec: async function(message, channel, server){
				return;
			},
			response: async function(message, channel, server){
				return `\`${server.checkCommand(message.split[1]).description}\``;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"setprefix" : {
			description: "Sets the prefix the bot uses for parsing commands.",
			use: "<prefix>setprefix <newprefix>",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				server.setPrefix(message.split[1]);
				return;
			},
			response: async function(message, channel, server){
				return `This server's prefix is now ${server.prefix}`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"refreshserver" : {
			description: "Completely rebuilds the server, allowing for new features to be enabled",
			use: "<prefix>refreshserver",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				const serverObj = server.toObject();
				await GhostBot.Discord.Guild.findByIdAndRemove(message.guild.id);
				
				for (let module in GhostBot.modules.lib){
					if (!serverObj.modules[module]) serverObj.modules[module] = {};
				};

				await GhostBot.Discord.Guild.create(serverObj);

				return;
			},
			response: async function(message, channel, server){
				return `Server is now refreshed.`;
			},
			defaultPermLevel: 4,
			possibleLengths: [1]
		},
		"viewserver" : {
			description: "Outputs server in object form",
			use: "<prefix>viewserver",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				const serverObj = server.toJSON();
				message.channel.send(`\`\`\`\n ${JSON.stringify(serverObj.modules)}\n\`\`\``)
				return;
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 4,
			possibleLengths: [1]
		},
	}

	for (let command in defaultModule){
		if (defaultModule[command].aliases){
			for (let n in defaultModule[command].aliases){
				defaultModule[defaultModule[command].aliases[n]] = defaultModule[command];
				defaultModule[defaultModule[command].aliases[n]].use = `<prefix>${defaultModule[command].aliases[n]}`;
			}
		}
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/

/* FUNCTIONS */
	function splitCommand(message, server){
		return message.content.substr(server.prefix.length).split(" ");
	}

	function stripCommand(message, server) {
		return message.content.substr(server.prefix.length + splitCommand(message, server)[0].length + 1);
	}

	function getTimeRemaining(tracker, id){
		if (!tracker || !tracker.container) throw {name: "OtherError", message: "Tracker misinitialized"};
		let period = tracker[tracker.container][id].period;
		if (!tracker[tracker.container][id].period) period = tracker.period;
		
		return period - (Date.now() - tracker[tracker.container][id].timeStamp);
	}

	function parseTime(number, format) {
		switch (format) {
		    case "minutes":
		    case "minute":
		        return number * 60000;
		        break;
		    case "seconds":
		    case "second":
		        return number * 1000;
		        break;
		    case "hours":
		    case "hour":
		        return number * 3600000;
		        break;
		    default:
		    	throw "invalid input";
		}
	}

	function makeReadable(milliseconds){
		if (milliseconds > 3600000){
			return (Math.floor(milliseconds/3600000) + " hours");
		} else if (milliseconds > 60000){
			return (Math.floor(milliseconds/60000) + " minutes");
		} else {
			return (Math.floor(milliseconds/1000) + " seconds");
		} 
	}

	function capitalizeFirstLetter(string) {
	    return string[0].toUpperCase() + string.slice(1);
	}

global.GhostBot.getTimeRemaining = getTimeRemaining;
global.GhostBot.splitCommand = splitCommand;
global.GhostBot.stripCommand = stripCommand;
global.GhostBot.makeReadable = makeReadable;
global.GhostBot.parseTime = parseTime;	
global.GhostBot.capitalizeFirstLetter = capitalizeFirstLetter;

module.exports = defaultModule;