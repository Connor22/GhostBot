/* ESSENTIAL CODE */
	var Discord = require("discord.js");
	var ModBot = new Discord.Client();

/* JS FUNCTION IMPORTS */
	var LimitedChannelFile = require("./LimitChannel.js");
	var ImageChannel = LimitedChannelFile.ImageChannel,
	    MessageChannel = LimitedChannelFile.MessageChannel,
	    loadFile = LimitedChannelFile.load,
	    stripUsers = LimitedChannelFile.stripUsers;

	var HelpersFile = require("./Helpers.js"),
	    isLimitedUser = HelpersFile.isLimitedUser,
	    modCheck = HelpersFile.modCheck,
	    checkArray = HelpersFile.checkArray;

	var CommandHandlersFile = require("./CommandHandlers.js"),
		commandHandler = CommandHandlersFile.commandHandler;

/* DICTIONARIES */
	var allChannelsFile = require("./channels.json");
	var allChannels = loadFile(allChannelsFile);

/* FILE FUNCTIONS */
	var jsonfs = require('jsonfile');
	jsonfs.spaces = 4;

/* USEFUL VARIABLES */
	var powerRoles = {
		modArray : ["Mods", "Admin/CEO/Senpai"],
		priviledgedRoles : ["Shining E-Peen"],
		primeUserArray : ["119759813377916928", "80866328507842560"]
	};
	var embedMatcher = /\bhttp\S*/g;
	var prefix = "=";
	var main = {
		bot : ModBot,
		imageChannels : allChannels.imageChannels,
		messageChannels : allChannels.messageChannels
	};

/* MAIN FUNCTION */
	ModBot.on("message", function(message){
		
		/* UPDATE DICTIONARIES */
			for (var dict in allChannels){
				for (var channel in allChannels[dict]){
					if (channel != "type"){
						allChannels[dict][channel].update();
					}
				}
			}
		/* LIMIT CHECK */
			performLimitChecks(message);

		/* CHECK COMMANDS */
			if(message.cleanContent.charAt(0) === prefix){
				if(modCheck(message, powerRoles)){
					commandHandler(message, main, "mod");
				} 
				commandHandler(message, main, "common");

				// Save channels and any changes to periods etc.
				var JSONallChannels = stripUsers(allChannels);
				jsonfs.writeFileSync("/root/TriBot/chatmodbot/channels.json", JSONallChannels);
			}

	});

/* SUBFUNCTIONS */
	function performLimitChecks(message){
		if (!message.author.equals(ModBot.user)){
			if (messageCheck(message)){
				userSentMessage(message, main.messageChannels);				
			}
			if (imageCheck(message)){
				userSentMessage(message, main.imageChannels);
			}
			if (URLCheck(message)){
				userSentMessage(message, main.imageChannels, message.cleanContent.match(embedMatcher).length);
			} 
		}
	}

	/* performLimitChecks SUBFUNCTIONS */
		function messageCheck(message){
			var skipLimits = ["limits", "clean"];
			return (message.channel.id in main.messageChannels 
				&& !checkArray(message.cleanContent.substr(1), skipLimits)
				&& isLimitedUser(message, powerRoles)
				&& (message.attachments.length === 0));
		}

		function imageCheck(message){
			return (message.channel.id in main.imageChannels 
				&& isLimitedUser(message, powerRoles)
				&& (message.attachments.length > 0));
		}

		function URLCheck(message){
			return (message.channel.id in main.imageChannels
				&& message.cleanContent.match(embedMatcher)
				&& main.imageChannels[message.channel.id].isURLEnabled());
		}

	function userSentMessage(message, channelCollection, amount){
		var user = channelCollection[message.channel.id].getUser(message.author.id);
		if (user.addSent(amount)){
			ModBot.deleteMessage(message);
			ModBot.sendMessage(message.author, user.warnMessage(message.channel.name));
		}
	}

/* POSSIBLE LOGINS */
	ModBot.login("username", "password");

/* DEBUG */
	function debug(message, text){
		ModBot.sendMessage(message.channel, text);
	}