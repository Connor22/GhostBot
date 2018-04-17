"use strict";
/* ESSENTIAL CODE */
	global.mongoose = require("mongoose");
	global.Discord = require("discord.js");
	global.GhostBot = new Discord.Client();	

/* MONGOOSE */
	mongoose.connect('mongodb://localhost/ghostbot');
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));

/* MODULE IMPORTS */
	GhostBot.config = require("./config");

	const modulesToLoad = GhostBot.config.modules;

	require("./lib/premodule");

	GhostBot.modules = {lib: {}, commands: {}};

	GhostBot.modules.commands.default = require(`./modules/commands/default.js`);

	for (let i in modulesToLoad){
		GhostBot.modules.lib[modulesToLoad[i]] = require(`./modules/lib/${modulesToLoad[i]}.js`);
		GhostBot.modules.commands[modulesToLoad[i]] = require(`./modules/commands/${modulesToLoad[i]}.js`);
		for (let command in GhostBot.modules.commands[modulesToLoad[i]]){
			if (GhostBot.modules.commands[modulesToLoad[i]][command].aliases){
				for (let n in GhostBot.modules.commands[modulesToLoad[i]][command].aliases){
					GhostBot.modules.commands[modulesToLoad[i]][GhostBot.modules.commands[modulesToLoad[i]][command].aliases[n]] = GhostBot.modules.commands[modulesToLoad[i]][command];
					GhostBot.modules.commands[modulesToLoad[i]][GhostBot.modules.commands[modulesToLoad[i]][command].aliases[n]].use = `<prefix>${GhostBot.modules.commands[modulesToLoad[i]][command].aliases[n]}`;
				}
			}
		}
	}

	require("./lib/postmodule");

	GhostBot.Guild = mongoose.model('Guild', GhostBot.serverSchema);
	GhostBot.Channel = mongoose.model('Channel', GhostBot.channelSchema);

/* MAIN FUNCTION */
	GhostBot.on("message", message => {
		/* CHECKS */
			if (!message.guild) return; //DMs shouldn't be handled
			if (message.author.bot) return; //Don't respond to bots

		/* DEFINE SHORTCUTS */
			GhostBot.Guild.findOne({_id: message.guild.id}).catch(console.log).then(function(server){
				// Handle first-time server access
				if (!server){
					const serverConstructor = {
						_id: message.guild.id, 
						name: message.guild.name,
						modules: {}
					};
					for (let module in GhostBot.modules.lib){
						console.log(`adding ${module}`);
						serverConstructor.modules[module] = {}
					}
					server = new GhostBot.Guild(serverConstructor);
				}
				
				console.log(server.isInitialized);

				let channel = null;
				if (server.isInitialized || GhostBot.splitCommand(message, server)[0] === "initialize") {
					/* PRECHECK */
						for (let func in GhostBot.preCheck){
							GhostBot.preCheck[func](message);
						}

					GhostBot.Channel.findOne({_id: message.channel.id}).catch(console.log).then(function(channel){
						// Handle first-time channel access
						if (!channel){
							channel = new GhostBot.Channel({_id: message.channel.id, name: message.channel.name, server: message.channel.parentID})
							server.channels.addToSet(message.channel.id);
						}

						/* COMMAND PROCESSING */
							//If message does not start with designated prefix, stop.
							if (!message.content.startsWith(server.prefix)) return;

							//Make sure user is cached before processing command
							if (!message.member){
								message.guild.fetchMember(message.author).then(preCommandCheck(message, channel, server))
							} else {
								preCommandCheck(message, channel, server);		
							}

							server.save();
					});
				} else {console.log(`${GhostBot.splitCommand(message, server)[0]} failed initialize`)}
			});
	});

	function preCommandCheck(message, channel, server){
		const commandName = GhostBot.splitCommand(message, server)[0];

		//Main command checker block
			try{
				// Misc Checking
					if (commandName == "ping"){
						if (message.author.id == "82980874429140992"){
							message.channel.send(server.checkCommand(commandName.toLowerCase(), message).response(message, channel, server));
						} else {
							message.reply("ping can only be used by Thoro please do not attempt again thanks");
						}
						return;
					}

				// Dev Command checking
					if (message.author.id === GhostBot.config.ids.dev && message.cleanContent.includes(GhostBot.config.pin)){
						if (commandName in devCommands) devCommands[commandName](message);
					}


				// Main Checking/Execution
					const command = server.checkCommand(commandName.toLowerCase(), message);

					if (command.name){
						if (command.name === "CommandNotFoundError"){
							console.log(`${commandName} not a command`);
							return;
						} else throw command;
					} 
					
					mainCommandCheck(message, server, channel, command);
				
			} catch (error) {
				switch (error.name){
					case "CommandError":
						message.channel.send(`:no_entry_sign: Invalid Command \`${commandName}\`: ${error.message}`).then((message) => message.delete(10000));
						message.delete(15000);
						break;
					case "OtherError":
						message.channel.send(`:no_entry: Error with command \`${commandName}\`: ${error.message}`).then((message) => message.delete(10000));
						message.delete(15000);
						break;
					default:
						message.channel.send(`:boom: Critical Error - Check the logs`); 
						console.log(error);
						//message.delete(15000);
						break;
				}
			}
	}

	function mainCommandCheck(message, server, channel, command){
		// Check if there are the correct number of arguments
		if (!command.possibleLengths.includes(GhostBot.splitCommand(message, server).length) && !command.possibleLengths.includes(0)) throw {name: "CommandError", message: "Invalid number of arguments"};

		// Check if the user is the proper permission level to use that command
		const permissionLevel = server.permissionLevelChecker(message.member, message.guild.id);
		if (permissionLevel < command.defaultPermLevel) throw {name: "CommandError", message: "Invalid permission level."}
		
		// Check for command-specific items
		if (command.check(message, channel, server) != "Success") throw command.check(message, channel, server);

		command.exec(message, channel, server);

		const response = command.response(message, channel, server);

		if (response) message.channel.send(response);
	}
/* DEBUG */
	GhostBot.on("ready", () => {
		console.log("ready");
	});

	GhostBot.on('debug', message => {
		if (message.toLowerCase().indexOf("heartbeat") === -1) console.log(message);
	});

	GhostBot.on('error', err =>{
		console.error(err);
	});

/* LOGIN */
	db.once('open', function() {
		GhostBot.login(GhostBot.config.tokens.bot);
	});