"use strict";
/* IMPORTS */
	const DiscordApp = require("discord.js");
	const GhostBot = new DiscordApp.Client({restWsBridgeTimeout: 50000, restTimeOffset: 5000});	
	const helpers = require(`./modules/helpers/default.js`);

/* CONFIG */
	const config = require("./config");
	const backend = require(`./backends/${config.backend}/${config.backend}.js`);

/* MODULES */
	const modulesToLoad = config.modules;
	modulesToLoad.push("default");
	const commands = {};

	for (let module of modulesToLoad){
		backend.modules[module] = module;

		let lib = require(`./modules/lib/${module}.js`);
		//backend manipulation
			lib.activate(backend);
			lib.addTriggers(GhostBot);
		
		commands[module] = require(`./modules/commands/${module}.js`).commands;
		
		for (let command in commands[module]){
			commandObject = commands[module][command];
			commandObject.module = module;
			if (commandObject.aliases){
				for (let alias of commandObject.aliases){
					commands[module][alias] = commandObject;
					commands[module][alias].use = `<prefix>${alias}`;
				}
			}
		}
	}

/* MAIN FUNCTION */
	GhostBot.on("message", message => {
		/* CHECKS */
			//DMs shouldn't be handled
				if (!message.guild) return; 
			//Don't respond to bots
				if (message.author.bot) return; 


		try{
			process(message);
		} catch (err) {
			console.log(err);
		}

	});

	async function process(message){
		/* CHECK IF SERVER IS INITIALIZED */
			if (!backend.Server.active.get(message.guild.id)) return;

		/* CHECK IF BOT IS ENABLED IN CHANNEL */
			if (!backend.Channel.active.get(message.channel.id)) return;

		/* ADD SPLIT MESSAGE FOR EASIER PARSING */
			message.split = helpers.splitCommand(message, (prefix ? prefix.length : 1));

		/* COMMAND PROCESSING */
			//If message does not start with designated prefix, stop.
				if (!message.content.startsWith(backend.Server.prefix.get(message.guild.id))) return;
			//Make sure user is cached before processing command
				await message.guild.members.fetch(message.author);

			commandCheck(message);		
	}

	async function commandCheck(message){
		const commandName = message.split[0];

		//Main command checker block
			try{
				// Misc Checking
					if (commandName == "ping"){
						if (message.author.id == "82980874429140992"){
							message.channel.send(checkCommand(message.guild.id, commandName.toLowerCase(), message)
								.response(message)).catch(console.log);
						} else {
							message.reply("ping can only be used by Thoro please do not attempt again thanks");
						}
						return;
					}

				// Dev Command checking */
					if (devCommands && message.author.id === config.ids.dev && message.cleanContent.includes(config.pin)){
						if (commandName in devCommands) devCommands[commandName](message);
					}
				


				// Main Checking/Execution
					const command = checkCommand(commandName.toLowerCase(), message);

					if (command.name){
						if (command.name === "CommandNotFoundError"){
							return;
						} else throw command;
					} else if (!command.module === "default" && backend.Server.attr.get(message.guild.id, command.module, "enabled")){
						throw {name: "CommandError", message: `Module ${command.module} is not enabled on this message.guild.id.`};
					}
					
					commandExec(message, command);
				
			} catch (error) {
				switch (error.name){
					case "CommandError":
						message.channel.send(`:no_entry_sign: Invalid Command \`${commandName}\`: ${error.message}`)
							.then((message) => message.delete(10000)).catch(console.log);
						message.delete(15000);
						break;
					case "OtherError":
						message.channel.send(`:no_entry: Error with command \`${commandName}\`: ${error.message}`)
							.then((message) => message.delete(10000)).catch(console.log);
						message.delete(15000);
						break;
					default:
						message.channel.send(`:boom: Critical Error - Check the logs`).catch(console.log); 
						console.log(error);
						break;
				}
			}
	}

	async function commandExec(command, message){
		// Check if there are the correct number of arguments
			if (!command.possibleLengths.includes(message.split.length) && !command.possibleLengths.includes(0)) 
				throw {name: "CommandError", message: "Invalid number of arguments"};

		// Check if the user is the proper permission level to use that command
			const permissionLevel = backend.permissionLevelChecker(message);
			if (permissionLevel < command.defaultPermLevel) 
				throw {name: "CommandError", message: "Invalid permission level."}
		
		// Check for command-specific items
			try{ 
				const commandVerification = await command.check(bot, backend, message);
				if (commandVerification != "Success") throw commandVerification;
			
				await command.exec(bot, backend, message);
		
				const response = await command.response(bot, backend, message);

				if (response) message.channel.send(response).catch(console.log);

				backend.save();
			} catch (error) {
				switch (error.name){
					case "CommandError":
						message.channel.send(`:no_entry_sign: Invalid Command \`${message.split[0]}\`: ${error.message}`)
							.then((message) => message.delete(10000)).catch(console.log);
						message.delete(15000);
						break;
					case "OtherError":
						message.channel.send(`:no_entry: Error with command \`${message.split[0]}\`: ${error.message}`)
							.then((message) => message.delete(10000)).catch(console.log);
						message.delete(15000);
						break;
					default:
						message.channel.send(`:boom: Critical Error - Check the logs`).catch(console.log); 
						console.log(error);
						//message.delete(15000);
						break;
				}
			}
	}

/* DEBUG */
	GhostBot.on("ready", () => {
		console.log("ready");
	});

	GhostBot.on('debug', async message => {
		if (message.toLowerCase().indexOf("heartbeat") === -1) console.log(message);
	});

	GhostBot.on('error', err =>{
		console.error(err);
	});

	const events = {
		MESSAGE_REACTION_ADD: 'messageReactionAdd',
		MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
	};

/* Re-emit emoji events 
	GhostBot.on('raw', async event => {
		// `event.t` is the raw event name
		if (!events.hasOwnProperty(event.t)) return;

		const { d: data } = event;
		const user = GhostBot.users.cache.get(data.user_id);
		const channel = GhostBot.channels.cache.get(data.channel_id) || await user.createDM();

		// if the message is already in the cache, don't re-emit the event
		if (channel.messages.cache.has(data.message_id)) return;

		// if you're on the master/v12 branch, use `channel.messages.fetch()`
		const message = await channel.messages.fetch(data.message_id);

		// custom emojis reactions are keyed in a `name:ID` format, while unicode emojis are keyed by names
		// if you're on the master/v12 branch, custom emojis reactions are keyed by their ID
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		const reaction = message.reactions.cache.get(emojiKey);

		GhostBot.emit(events[event.t], reaction, user);
	});
/* */

/* LOGIN */
	mainDBConnection.once('open', () => {
		GhostBot.login(config.tokens.bot);
		// setInterval(performMaintenance, 20000);
		// backend.performMaintenance();
	});

