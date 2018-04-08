"use strict";

/* ESSENTIAL CODE */
	global.Discord = require("discord.js");
	global.GhostBot = new Discord.Client();	

/* JS FUNCTION IMPORTS */
	const ClassesFile = require("./lib/Classes.js");
	const MaintenanceFile = require("./lib/Maintenance.js")

	const setupBot = require("./lib/setup.js").setupBot;

	const modulesToLoad = [
	"default", 
	"administration", 
	"slowmode", 
	"usercustom",
	"voting",
	"rules"
	];

	global.GhostBot.loadedModules = {};

	for (let i in modulesToLoad){
		GhostBot.loadedModules[modulesToLoad[i]] = require(`./commands/modules/${modulesToLoad[i]}.js`);
	}

/* DICTIONARIES */
	const serverStoreLocation = "/root/GhostBot/storage/serverStore.json";
	const tempStoreLocation = "/root/GhostBot/storage/tempStore.json";
	global.GhostBot.config = require("./storage/config.json");
	global.GhostBot.serverStore = require(serverStoreLocation);

/* FILE FUNCTIONS */
	const jsonfs = require('jsonfile');
	jsonfs.spaces = 4;

	const fs = require('fs');

/* UPDATE DICTIONARIES */
	function updateTrackersAndSave(){
		for (let tserver in serverStore){
			serverStore[tserver].update();
		}
		jsonfs.writeFileSync(tempStoreLocation, serverStore);
		fs.rename(tempStoreLocation, serverStoreLocation, function(err){if(err) console.error(err);});
		
		setTimeout(updateTrackersAndSave, 5000);
	}

/* BOOTUP SEQUENCE */
	verifyStaticStorage(serverStore);
	convertClasses(serverStore);

/* MAIN FUNCTION */
	GhostBot.on("message", message => {
		const channel = (function(){if(server) return fetchChannel(message);})();
		const server = fetchServer(message);

		if (!server) {
			return; //If server has not been setup yet, stop.
			console.log("server has not been initiliazed");
		}

		if (!message.guild) return; //DMs shouldn't be handled	

		/* LIMIT CHECK */
			if (channel) performLimitChecks(message);

		if (channel.static.config.addPostVoting) {
			message.react("⬆").then(setTimeout(function(){message.react("⬇").catch(console.log)},2000)).catch(console.log);
		}

		if (!message.content.startsWith(server.static.config.prefix) || message.author.bot) return; //If message does not start with designated prefix, stop.

		if (!message.member){
			message.guild.fetchMember(message.author).then(commandCheck(message, server, channel))
		} 
		else {
			commandCheck(message, server, channel);		
		}
	});	

	function commandCheck(message, server, channel){

		const commandName = splitCommand(message)[0];

		//Main command checker block
			try{

				if (message.author.id === config.ids.dev && message.cleanContent.includes(config.pin)){
					if (commandName in devCommands) devCommands[commandName](message);
				}

				const command = server.checkCommand(commandName.toLowerCase(), message);

				if (command.name){
					if (command.name === "CommandNotFoundError"){
						console.log(`${commandName} not a command`);
						return;
					} else throw command;
				} 

				if (!command.possibleLengths.includes(splitCommand(message).length) && !command.possibleLengths.includes(0)) throw {name: "CommandError", message: "Invalid number of arguments"};

				const permissionLevel = permissionLevelChecker(message.member, message.guild.id);
				if (permissionLevel < command.defaultPermLevel) throw {name: "CommandError", message: "Invalid permission level."}
				
				if (command.check(message) != "Success") throw command.check(message);

				command.exec(message);

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
/* DEBUG */
	GhostBot.on("ready", () => {
		updateTrackersAndSave();
		console.log("ready");
	});

	GhostBot.on('debug', message => {
		if (message.toLowerCase().indexOf("heartbeat") === -1) console.log(message);
	});

	GhostBot.on('error', err =>{
		console.error(err);
	});

	GhostBot.on('guildMemberAdd', member => {
		if (serverStore[member.guild.id].users[member.id] && serverStore[member.guild.id].users[member.id].modules.administration.isBanned){
			member.addRole(serverStore[member.guild.id].static.modules.administration.roles.softban);
		}
	});

/* LOGIN */
	GhostBot.login(config.tokens.bot); //Live