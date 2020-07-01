"use strict";
/* ESSENTIAL CODE */
	global.mongoose = require("mongoose");
	global.Discord = require("discord.js");
	global.GhostBot = new Discord.Client({restWsBridgeTimeout: 50000, restTimeOffset: 5000});	

/* MONGOOSE */
	const options = {
		autoReconnect:true,

		poolSize: 20,
		socketTimeoutMS: 480000,
		keepAlive: 300000,

		keepAliveInitialDelay : 300000,
		connectTimeoutMS: 30000,
		reconnectTries: Number.MAX_VALUE,
		reconnectInterval: 1000,
		useNewUrlParser: true
	}
	

	const maindb = mongoose.createConnection('mongodb://localhost:27017/ghostbot', options);
	const discorddb = mongoose.createConnection('mongodb://localhost:27017/discord', options);
	const twitchdb = mongoose.createConnection('mongodb://localhost:27017/twitch', options);

/* MODULES */
	GhostBot.config = require("./config");
	GhostBot.Discord = {};
	GhostBot.Twitch = {};

	require("./lib/premodule.js");
	
	const modulesToLoad = GhostBot.config.modules;
	GhostBot.modules = {lib: {}, commands: {}};
	GhostBot.modules.commands.default = require(`./modules/commands/default.js`);

	for (let i in modulesToLoad){
		GhostBot.modules.lib[modulesToLoad[i]] = require(`./modules/lib/${modulesToLoad[i]}.js`);
		GhostBot.modules.commands[modulesToLoad[i]] = require(`./modules/commands/${modulesToLoad[i]}.js`);
		for (let command in GhostBot.modules.commands[modulesToLoad[i]]){
			GhostBot.modules.commands[modulesToLoad[i]][command].module = modulesToLoad[i];
			if (GhostBot.modules.commands[modulesToLoad[i]][command].aliases){
				for (let n in GhostBot.modules.commands[modulesToLoad[i]][command].aliases){
					GhostBot.modules.commands[modulesToLoad[i]][GhostBot.modules.commands[modulesToLoad[i]][command].aliases[n]] = GhostBot.modules.commands[modulesToLoad[i]][command];
					GhostBot.modules.commands[modulesToLoad[i]][GhostBot.modules.commands[modulesToLoad[i]][command].aliases[n]].use = `<prefix>${GhostBot.modules.commands[modulesToLoad[i]][command].aliases[n]}`;
				}
			}
		}
	}

	require("./lib/postmodule.js");

/* MONGOOSE MODELS */
	GhostBot.Discord.Guild = discorddb.model('Guild', GhostBot.discordServerSchema);
	GhostBot.Discord.Channel = discorddb.model('Channel', GhostBot.discordChannelSchema);

	GhostBot.Community = maindb.model('Community', GhostBot.communitySchema);
	GhostBot.User = maindb.model('User', GhostBot.userSchema);

	GhostBot.Twitch.Channel = twitchdb.model('Channel', GhostBot.twitchChannelSchema);

/* MAIN FUNCTION */
	GhostBot.on("message", message => {
		/* CHECKS */
			if (!message.guild) return; //DMs shouldn't be handled
			if (message.author.bot) return; //Don't respond to bots
			try{
				process(message);
			} catch (err) {
				console.log(err);
			}
	});

	async function process(message){
		/* FETCH SERVER */
			let server = await GhostBot.Discord.Guild.findOne({_id: message.guild.id});
			// Handle first-time server access
				if (!server){
					server = await constructServer(message);
				}
			// Check server initialization status
				// Useful shortcut
				message.split = GhostBot.splitCommand(message, server);
				if (!server.isInitialized || !message.split[0] === "initialize") return;
			
				

		/* FETCH CHANNEL */
			let channel = await GhostBot.Discord.Channel.findOne({_id: message.channel.id});
			// Handle first-time channel access
				if (!channel){
					channel = new GhostBot.Discord.Channel({_id: message.channel.id, name: message.channel.name, server: message.channel.parentID})
					server.channels.addToSet(message.channel.id);
				}

		/* COMMAND PROCESSING */
			//If message does not start with designated prefix, stop.
				if (!message.content.startsWith(server.prefix)) return;
			//Make sure user is cached before processing command
				await message.guild.fetchMember(message.author);
			commandCheck(message, channel, server);		
	}

	function commandCheck(message, channel, server){
		const commandName = message.split[0];

		//Main command checker block
			try{
				// Misc Checking
					if (commandName == "ping"){
						if (message.author.id == "82980874429140992"){
							message.channel.send(server.checkCommand(commandName.toLowerCase(), message).response(message, channel, server)).catch(console.log);
						} else {
							message.reply("ping can only be used by Thoro please do not attempt again thanks");
						}
						return;
					}

				/* Dev Command checking
					if (message.author.id === GhostBot.config.ids.dev && message.cleanContent.includes(GhostBot.config.pin)){
						if (commandName in devCommands) devCommands[commandName](message);
					}
				*/


				// Main Checking/Execution
					const command = server.checkCommand(commandName.toLowerCase(), message);

					if (command.name){
						if (command.name === "CommandNotFoundError"){
							return;
						} else throw command;
					} else if (!command.module === "default" && server.modules[command.module].enabled){
						throw {name: "CommandError", message: `Module ${command.module} is not enabled on this server.`};
					}
					
					commandExec(message, server, channel, command);
				
			} catch (error) {
				switch (error.name){
					case "CommandError":
						message.channel.send(`:no_entry_sign: Invalid Command \`${commandName}\`: ${error.message}`).then((message) => message.delete(10000)).catch(console.log);
						message.delete(15000);
						break;
					case "OtherError":
						message.channel.send(`:no_entry: Error with command \`${commandName}\`: ${error.message}`).then((message) => message.delete(10000)).catch(console.log);
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

	async function commandExec(message, server, channel, command){
		// Check if there are the correct number of arguments
			if (!command.possibleLengths.includes(message.split.length) && !command.possibleLengths.includes(0)) throw {name: "CommandError", message: "Invalid number of arguments"};

		// Check if the user is the proper permission level to use that command
			const permissionLevel = server.permissionLevelChecker(message.member, message.guild.id);
			if (permissionLevel < command.defaultPermLevel) throw {name: "CommandError", message: "Invalid permission level."}
		
		// Check for command-specific items
			try{ 
				const commandVerification = await command.check(message, channel, server);
				if (commandVerification != "Success") throw commandVerification;
			
				await command.exec(message, channel, server);
		
				const response = await command.response(message, channel, server);

				if (response) message.channel.send(response).catch(console.log);

				server.markModified(`modules.${command.module}`);
				// console.log(`About to save server`);
				server.save(function (err, server) {   
				  if (err) return console.log(err);    
				});
				// console.log(`About to save channel`);
				channel.save(function (err, channel) {   
				  if (err) return console.log(err);    
				});
			}
			catch (error) {
				switch (error.name){
					case "CommandError":
						message.channel.send(`:no_entry_sign: Invalid Command \`${message.split[0]}\`: ${error.message}`).then((message) => message.delete(10000)).catch(console.log);
						message.delete(15000);
						break;
					case "OtherError":
						message.channel.send(`:no_entry: Error with command \`${message.split[0]}\`: ${error.message}`).then((message) => message.delete(10000)).catch(console.log);
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

/* MISC */
	async function performMaintenance(){
		for (let guild in GhostBot.guilds.array()){
			const guildObject = GhostBot.guilds.array()[guild];
			GhostBot.Discord.Guild.findOne({_id: guildObject.id}).then((server) => {
				server.performMaintenance(guildObject);
				server.save();
			});
		};
	}

	async function constructServer(message){
		const serverConstructor = {
			_id: message.guild.id, 
			name: message.guild.name,
			modules: {}
		};

		for (let module in GhostBot.modules.lib){
			serverConstructor.modules[module] = {}
		};

		return new GhostBot.Discord.Guild(serverConstructor);
	}

/* DEBUG */
	function test(server){
	}

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

	GhostBot.on('raw', async event => {
		// `event.t` is the raw event name
		if (!events.hasOwnProperty(event.t)) return;

		const { d: data } = event;
		const user = GhostBot.users.get(data.user_id);
		const channel = GhostBot.channels.get(data.channel_id) || await user.createDM();

		// if the message is already in the cache, don't re-emit the event
		if (channel.messages.has(data.message_id)) return;

		// if you're on the master/v12 branch, use `channel.messages.fetch()`
		const message = await channel.fetchMessage(data.message_id);

		// custom emojis reactions are keyed in a `name:ID` format, while unicode emojis are keyed by names
		// if you're on the master/v12 branch, custom emojis reactions are keyed by their ID
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		const reaction = message.reactions.get(emojiKey);

		GhostBot.emit(events[event.t], reaction, user);
	});


/* LOGIN */
	maindb.once('open', () => {
		GhostBot.login(GhostBot.config.tokens.bot);
		//setInterval(performMaintenance, 20000);
		performMaintenance();
	});

