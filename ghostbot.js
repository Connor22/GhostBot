"use strict";

/* ESSENTIAL CODE */
	global.Discord = require("discord.js");
	global.GhostBot = new Discord.Client();

/* JS FUNCTION IMPORTS */
	const TrackerFile = require("./lib/LimitTracker.js");
	const HelpersFile = require("./lib/Helpers.js");	
	const FunctionsFile = require("./lib/Functions.js");

	const setupBot = require("./lib/setup.js").setupBot;

	const devCommands = require("./commands/devCommands.js"); 
	const adminCommands = require("./commands/adminCommands.js");
	const modCommands = require("./commands/modCommands.js");
	const jmodCommands = require("./commands/jmodCommands.js");
	const generalCommands = require("./commands/generalCommands.js"); 

/* DICTIONARIES */
	const serverStoreLocation = "/root/GhostBot-HN/storage/serverStore.json";
	const tempStoreLocation = "/root/GhostBot-HN/storage/tempStore.json";
	global.config = require("./storage/config.json");
	global.serverStore = require(serverStoreLocation);

/* FILE FUNCTIONS */
	const jsonfs = require('jsonfile');
	jsonfs.spaces = 4;

	const fs = require('fs');

/* UPDATE DICTIONARIES */
	function updateTrackersAndSave(){
		for (let tserver in serverStore){
			for (let tchannel in serverStore[tserver].channels){
				const channel = serverStore[tserver].channels[tchannel];
				if (channel.imageTracker) channel.imageTracker.update();
				if (channel.messageTracker) channel.messageTracker.update();
			}
		}
		jsonfs.writeFileSync(tempStoreLocation, serverStore);
		fs.rename(tempStoreLocation, serverStoreLocation, function(err){if(err) console.error(err);});
		
		setTimeout(updateTrackersAndSave, 5000);
	}

/* BOOTUP SEQUENCE */
	GhostBot.on("ready", () => {
		console.log("ready");
		convertTrackers(serverStore);
		updateTrackersAndSave();
	});
	

/* MAIN FUNCTION */
	GhostBot.on("message", message => {
		if (!message.guild) return; //DMs shouldn't be handled

		if (message.author.bot) return; //Don't respond to bots

		const server = fetchServer(message);
		const channel = (function(){if(server) return fetchChannel(message);})();

		

		/* LIMIT CHECK */
			if (channel) performLimitChecks(message);

		// if (message.content === "=serverStore") console.log(serverStore);//debug
		// if (message.content === "=debugChannel") console.log(fetchChannel(message));//debug
		// if (message.content === "=debugUsers"){ console.log(selectTracker(message, "message"));
			// for (const userID in selectTracker(message, "message").users){
			// 	console.log(selectTracker(message, "message").users[userID]);
			// }
		// } //debug

		if (!server && message.content === "=setup"){
			setupBot(message);
			console.log("setting up new server");
		}//If the server has not been set up yet, and bot receives a setup command, commence setup sequence.

		if (!server) {
			return; //If server has not been setup yet, stop.
			console.log("server has not been initiliazed");
		}

		if (message.channel.id === "234186792008417281" || message.channel.id === "362098660173021184") {
			message.react("⬆").then(setTimeout(function(){message.react("⬇").catch(console.log)},2000)).catch(console.log);
		}

		if (!message.content.startsWith(server.prefix)) return; //If message does not start with designated prefix, stop.

		if (!message.member){
			message.guild.fetchMember(message.author).then(commandCheck(message, server, channel))
		} 
		else {
			commandCheck(message, server, channel);		
		}
	});	

	function commandCheck(message, server, channel){
		//Main command checker block
			try{
				if (message.author.id === config.ids.dev && message.cleanContent.includes("999655065")){
					if (splitCommand(message)[0] in devCommands) devCommands[splitCommand(message)[0]](message);
				}

				const permissionLevel = permissionLevelChecker(message.member, message.guild.id);

				switch (permissionLevel){
					case 1:
						if (splitCommand(message)[0].toLowerCase() in adminCommands){
							adminCommands[splitCommand(message)[0].toLowerCase()](message);
							//message.delete(2000);
						}
					case 2:
						if (splitCommand(message)[0].toLowerCase() in modCommands){
							modCommands[splitCommand(message)[0].toLowerCase()](message);
							//message.delete(2000);
						}
					case 3:
						if (splitCommand(message)[0].toLowerCase() in jmodCommands){
							jmodCommands[splitCommand(message)[0].toLowerCase()](message);
							//message.delete(2000);
						}
					default:
						if (splitCommand(message)[0].toLowerCase() in generalCommands){
							generalCommands[splitCommand(message)[0].toLowerCase()](message);
							//message.delete(2000);
						}
						break;
				}
			} catch (error) {
				switch (error.name){
					case "CommandError":
						message.channel.sendMessage(`:no_entry_sign: Invalid Command \`${splitCommand(message)[0]}\`: ${error.message}`)//.then((message) => message.delete(3000));
						//message.delete(5000);
						break;
					case "OtherError":
						message.channel.sendMessage(`:no_entry: Error with command \`${splitCommand(message)[0]}\`: ${error.message}`)//.then((message) => //message.delete(3000));
						//message.delete(5000);
						break;
					default:
						message.channel.sendMessage(`:boom: Critical Error - Check the logs`); 
						console.log(error);
						//message.delete(5000);
						break;
				}
			}
	}
/* DEBUG */
	GhostBot.on('debug', message => {
		if (message.toLowerCase().indexOf("heartbeat") === -1) console.log(message);
	});

	GhostBot.on('error', err =>{
		console.error(err);
	});

	GhostBot.on('guildMemberAdd', member => {
		if (!member || !member.guild) return;
		if (serverStore[member.guild.id].bannedUsers && serverStore[member.guild.id].bannedUsers.indexOf(member.id) != -1){
			member.addRole("256713025061519370");
		}
	});

/* LOGIN */
	GhostBot.login(config.bot.token); //Live
	//GhostBot.login(config.bot.token); //Dev