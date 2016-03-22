/* JS FUNCTION IMPORTS */
	var HelpersFile = require("./Helpers.js");
	var matchCommandTypes = HelpersFile.matchCommandTypes;

	var LimitedChannelFile = require("./LimitChannel.js");
	var ImageChannel = LimitedChannelFile.ImageChannel;
	var MessageChannel = LimitedChannelFile.MessageChannel;

	function commandHandler(message, main, typeOfCommand){
		var command = message.cleanContent.substr(1);
		var splitCommands = command.split(" ");	
		switch (typeOfCommand){
			case "common":
				checkCommands(message, main, command, splitCommands);
				break;
			case "mod":
				modCommands(message, main, command, splitCommands);
				break;
			default:
				break;
		}
	}

	function checkCommands(message, main, command, splitCommands){ //Parent function : Main Function
		switch (command){
			case "clean":
				prune(message, main, main.bot.user);
				main.bot.deleteMessage(message);
				break;
			case "limits":
				main.bot.sendMessage(message.author, informLimits(message, main));
				main.bot.deleteMessage(message);
				break;
			default:
				break;
		}

		if (message.channel.server.id === "147921217502969857"){
			if (matchCommandTypes(splitCommands, "color", {1: "either"}) && isHexCode(splitCommands[1])){
				changeColor(message, splitCommands[1], main);
			} else if (splitCommands[0] === "color"){
				main.bot.sendMessage(message.channel, "Use a hexcode generate such as http://www.w3schools.com/colors/colors_picker.asp to help pick your colour!");
			}
		}
	}

	/* checkCommands SUBFUNCTIONS */
		// DELETE ALL MESSAGES WITH BOT AS AUTHOR
		function prune(message, main, user){ //Parent function : checkCommands
			var myMsgs = message.channel.messages.getAll("author", user);
			for (var i = 0, len = myMsgs.length; i < len; i++) {
				main.bot.deleteMessage(myMsgs[i]);
			}
		}

		// CHANGE USER'S COLOUR
		function changeColor(message, hexcode, main){
			var user = message.author;
			var server = message.channel.server;
			if (server.detailsOfUser(message.author).roles[0] && server.detailsOfUser(message.author).roles[0].name === user.id){
				main.bot.updateRole(server.roles.get("name", user.id), {color : parseInt("0x" + hexcode)});
			} else {
				main.bot.createRole(server, {color : parseInt("0x" + hexcode), name : user.id, hoist : false}, function(err, role){addMember(user, role); console.error(err);});
			}
		}

	function modCommands(message, main, command, splitCommands){ //Parent function : checkCommands
		// Mod Tools
		if (matchCommandTypes(splitCommands, "prune", {1: "either"})){
			if (message.mentions.length === 1){
				prune(message, main, message.mentions[0]);
			} else {
				debug(message, main, "mentions length: " + message.mentions.length);
			}
		}

		// Limit related
		var channelDict = null;

		switch(splitCommands[1]){
			case "image":
			case "images":
				channelDict = main.imageChannels;
				break;
			case "message":
			case "messages":
				channelDict = main.messageChannels;
				break;
			default:
				break;
		}
		
		var channel = null;

		if (channelDict){
			channel = channelDict[message.channel.id];
		}

		if (channel){
			if (splitCommands[0] === "resetlimit"){
				if (message.mentions.length === 1 && channel.getUser(message.mentions[0].id)){
					channel.getUser(message.mentions[0].id).sentReset();
				}
			}
			if(splitCommands[0] === "stoplimit"){
				stoplimit(message, channelDict, main);
			} 
			else if(matchCommandTypes(splitCommands, "limit", {1: "string", 2: "number"})){
				channel.changeLimit(parseInt(splitCommands[2]));
				main.bot.sendMessage(message.channel, channel.limitMessage());
			} 
			else if (matchCommandTypes(splitCommands, "limit", {1: "string"})){
				main.bot.sendMessage(message.channel, channel.limitMessage());
			}
			else if(matchCommandTypes(splitCommands, "period", {1: "string", 2: "number", 3: "string"})){
				setPeriod(message, main, splitCommands, channel);
			}
			else if (matchCommandTypes(splitCommands, "period", {1: "string"})){
				main.bot.sendMessage(message.channel, channel.periodMessage());
			}
		}

		if(splitCommands[0] === "startlimit" && !channel) {
			startlimit(message, channelDict, main);
		}
	}

	/* modCommands SUBFUNCTIONS */
			function setPeriod(message, main, splitCommands, channel){
				switch (splitCommands[3]) {
				    case "minutes":
				    case "minute":
				        channel.period = (splitCommands[2] * 60000);
				        break;
				    case "seconds":
				    case "second":
				        channel.period = (splitCommands[2] * 1000);
				        break;
				    case "hours":
				    case "hour":
				        channel.period = (splitCommands[2] * 3600000);
				        break;
				    default:
				    	main.bot.sendMessage(message.channel, "Not a valid amount");
				    	return;
				}

				main.bot.sendMessage(message.channel, channel.periodMessage());
			}

			function informLimits(message, main){
				var constructedMessage = "Your limits on `" + message.channel.server.name + " - #" + message.channel.name + "`: \n";
				
				var channel = main.messageChannels[message.channel.id];
				if (channel){
					var user = main.messageChannels[message.channel.id].getUser(message.author.id);
					if (user){
						constructedMessage += ("```You have posted " + user.getSentAmount() + "/" + channel.limit + " messages. \n");
						constructedMessage += ("You have " + makeReadable(user.getTimeRemaining(), channel.period)+ " remaining before your message limit reset \n");
					} else {
						constructedMessage += ("```You have posted 0/" + channel.limit + " messages. \n");
					}
				} else {
					constructedMessage += ("```Messages are not being limited on this channel \n");
				}

				constructedMessage += "---\n";

				channel = main.imageChannels[message.channel.id];
				if (channel){
					var user = main.imageChannels[message.channel.id].getUser(message.author.id);
					if (user){
						constructedMessage += ("You have posted " + user.getSentAmount() + "/" + channel.limit + " images. \n");
						constructedMessage += ("You have " + makeReadable(user.getTimeRemaining()) + " remaining before your image limit reset```");
					} else {
						constructedMessage += ("You have posted 0/" + channel.limit + " images. ```");
					}
				} else {
					constructedMessage += ("Images are not being limited on this channel```");
				}

				return constructedMessage;
			}

			function stoplimit(message, channelDict, main){
				main.bot.sendMessage(message.channel, capitalizeFirstLetter(channelDict[message.channel.id].type) + " limiting disabled on this channel.");				
				delete channelDict[message.channel.id];
			}

			function startlimit(message, channelDict, main){
				switch(channelDict.type){
					case "image":
						channelDict[message.channel.id] = new ImageChannel();
					case "message":
						channelDict[message.channel.id] = new MessageChannel();
				}
				 
				main.bot.sendMessage(message.channel,  capitalizeFirstLetter(channelDict[message.channel.id].type) + " limiting enabled on this channel.");
			}

	function addMember(user, role, main){
		main.bot.addMemberToRole(user, role, function(err){console.error(err);});
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

	function isHexCode(hexcode){
		return /^[0-9A-F]{6}$/i.test(hexcode);
	}

	function capitalizeFirstLetter(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/* DEBUG */
	function debug(message, main, text){
		main.bot.sendMessage(message.channel, text);
	}


exports.commandHandler = commandHandler;