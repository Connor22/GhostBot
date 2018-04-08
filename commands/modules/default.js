/* COMMAND OBJECTS */
	const defaultModule = {
		"ping" : {
			description: "Responds to ping",
			use: "<prefix>ping",
			check: function(message){
				return "Success";
			},
			exec: function(message){
				message.reply("pong");
			},
			response: function(message){

			},
			defaultPermLevel: 1,
			possibleLengths: [1]
		},
		"trello" : {
			description: "Posts the Trello development board",
			use: "<prefix>trello",
			check: function(message){
				return "Success";
			},
			exec: function(message){
				message.channel.send("https://trello.com/b/rwz2I6KE/ghostbot");
			},
			response: function(message){

			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		},
		"enable" : {
			description: "Enables the specified module for the current server",
			use: "<prefix>enable <module>",
			check: function(message){
				if (!Object.keys(fetchServer(message).static.modules).includes(splitCommand(message)[1])) return {name: "OtherError", message: `Could not find module \`${splitCommand(message)[1]}\``};
				return "Success";
			},
			exec: function(message){
				fetchServer(message).static.modules[splitCommand(message)[1]].enabled = true;
			},
			response: function(message){

			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"setperms" : {
			description: "Sets a whitelist or blacklist entry for the specified module or command",
			use: "<prefix>setperms [whitelist|blacklist] <type> <id> <module> {command}",
			check: function(message){
				if (!["whitelist", "blacklist"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "First argument needs to be `whitelist` or `blacklist`"};

				if (!["user", "role", "channel"].includes(splitCommand(message)[2])) return {name: "CommandError", message: "Second argument needs to be `user`, `role` or `channel`"};

				if (!Object.keys(fetchServer(message).static.modules).includes(splitCommand(message)[4])) return {name: "OtherError", message: `Could not find module \`${splitCommand(message)[4]}\``};

				if (splitCommand(message).length === 6 && !Object.keys(loadedModules[splitCommand(message)[4]]).includes(splitCommand(message)[5])) return {name: "OtherError", message: `Could not find command \`${splitCommand(message)[5]}\``};

				return "Success";
			},
			exec: function(message){
				if (splitCommand(message).length === 5){
					fetchServer(message).setPerms(splitCommand(message)[1] === "whitelist", splitCommand(message)[2] + "s", splitCommand(message)[3], splitCommand(message)[4]);
				} else {
					fetchServer(message).setPerms(splitCommand(message)[1] === "whitelist", splitCommand(message)[2] + "s", splitCommand(message)[3], splitCommand(message)[4], splitCommand(message)[5]);
				}
			},
			response: function(message){

			},
			defaultPermLevel: 3,
			possibleLengths: [5, 6]
		}, 
		"resetperms" : {
			description: "Resets permissions for the specified command or module",
			use: "<prefix>setperms <module> {command}",
			check: function(message){
				if (!Object.keys(fetchServer(message).static.modules).includes(splitCommand(message)[1])) return {name: "OtherError", message: `Could not find module \`${splitCommand(message)[1]}\``};

				if (splitCommand(message).length === 3 && !Object.keys(loadedModules[splitCommand(message)[1]]).includes(splitCommand(message)[5])) return {name: "OtherError", message: `Could not find command \`${splitCommand(message)[2]}\``};

				return "Success";
			},
			exec: function(message){
				fetchServer(message).resetPerms(splitCommand(message)[1], splitCommand(message)[2]);
			},
			response: function(message){

			},
			defaultPermLevel: 3,
			possibleLengths: [2, 3]
		}
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: function(message){
				return "Success";
			},
			exec: function(message){
			},
			response: function(message){

			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/

/* FUNCTIONS */
	function permissionLevelChecker(member, serverID){
		if (!member) return 0;
		if (checkPermissions(member, "admin", serverID) || member.hasPermission('ADMINISTRATOR')){
			return 3;
		} else if (checkPermissions(member, "mod", serverID)){
			return 2;
		} else  if (checkPermissions(member, "jmod", serverID)) {
			return 1;
		} else {
			return 0;
		}
	}

	function checkPermissions(member, level, serverID){
		const server = serverStore[serverID];
		if (!member || !server) return false;

		if (!member.roles){
			console.log("Roles not found");
			return false;
		}
		return member.roles.exists('name', server.static.modules.administration.roles[level].name) ||
		 member.roles.has(server.static.modules.administration.roles[level].id);
	}

	function fetchServer(message){
		return serverStore[message.guild.id];
	}

	function fetchChannel(message){
		if (!serverStore[message.guild.id].channels[message.channel.id]) {
			serverStore[message.guild.id].addChannel(message.channel.id, {
				channelName: message.channel.name,
				channelID: message.channel.id,
				serverID: message.guild.id
			});
		}
		return serverStore[message.guild.id].channels[message.channel.id];
	}

	function convertClasses(serverStore) {
		for (let tserver in serverStore){
			/*
				for (let tchannel in serverStore[tserver].channels){
					const channel = serverStore[tserver].channels[tchannel];
					serverStore[tserver].channels[tchannel] = newServer.addChannel(tchannel, channel);
				}
				for (let tusers in serverStore[tserver].users){
					const user = serverStore[tserver].users[tuser];
					serverStore[tserver].users[tuser] = newServer.addUser(tuser, user);
				}
			*/
			serverStore[tserver] = new Guild(serverStore[tserver]);
		}
	}

	function splitCommand(message){
		return message.content.substr(fetchServer(message).static.config.prefix.length).split(" ");
	}

	function stripCommand(message) {
		return message.content.substr(fetchServer(message).static.config.prefix.length + splitCommand(message)[0].length + 1);
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
global.GhostBot.checkPermissions = checkPermissions;
global.GhostBot.permissionLevelChecker = permissionLevelChecker;
global.GhostBot.fetchServer = fetchServer;
global.GhostBot.fetchChannel = fetchChannel;
global.GhostBot.convertClasses = convertClasses;
global.GhostBot.splitCommand = splitCommand;
global.GhostBot.stripCommand = stripCommand;
global.GhostBot.makeReadable = makeReadable;
global.GhostBot.parseTime = parseTime;	
global.GhostBot.capitalizeFirstLetter = capitalizeFirstLetter;

module.exports = defaultModule;