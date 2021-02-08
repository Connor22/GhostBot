/* COMMAND OBJECTS */
	const slowmodeModule = {
		"stoplimit" : {
			description: "Stops the limiting of the specified type of message in the current channel",
			use: "<prefix>stoplimit [image|message]",
			check: async function(message){
				if (!["message", "image", "messages", "images"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
				if (!selectTracker(message, splitCommand(message)[1]).active) return {name: "CommandError", message: "Monitoring for " + splitCommand(message)[1] +" is already disabled"};

				return "Success";
			},
			exec: async function(message){
				const tracker = selectTracker(message, splitCommand(message)[1]);

				message.channel.send(capitalizeFirstLetter(tracker.type) + " limiting disabled on this channel.");				
				fetchChannel(message).toggleTracker(tracker.type);
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"startlimit" : {
			description: "Starts the limiting of the specified type of message in the current channel",
			use: "<prefix>startlimit [image|message]",
			check: async function(message){
				if (!["message", "image", "messages", "images"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
				if (selectTracker(message, splitCommand(message)[1]).active) return {name: "CommandError", message: "Monitoring for " + splitCommand(message)[1] +" is already enabled"};

				return "Success";
			},
			exec: async function(message){
				const tracker = selectTracker(message, splitCommand(message)[1]);

				fetchChannel(message).toggleTracker(tracker.type);
				message.channel.send(capitalizeFirstLetter(tracker.type) + " limiting enabled on this channel.");
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"resetlimit" : {
			description: "Resets the mentioned user's limit for the specific type of limiting",
			use: "",
			check: async function(message){
				if (!["message", "image", "messages", "images"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
				if (message.mentions.users.cache.array().length < 1) return {name: "CommandError", message: "Need to mention one user"};

				return "Success";
			},
			exec: async function(message){
				fetchChannel(message).resetTracker(message.mentions.users.cache.array()[0].id, splitCommand(message)[1]);
			},
			defaultPermLevel: 2,
			possibleLengths: [3]
		}, 
		"limit" : {
			description: "If new limit is specified, change the message limit of the specified type to that. Outputs current limit either way.",
			use: "<prefix>limit [image|message] {<number>}",
			check: async function(message){
				const length = splitCommand(message).length;

				if (!["message", "image", "messages", "images"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
				if (length > 2 && isNaN(splitCommand(message)[2])) return {name: "CommandError", message: "Second argument must be a valid number"};

				return "Success";
			},
			exec: async function(message){
				const channel = fetchChannel(message);

				if (splitCommand(message).length === 3) channel.changeTrackerLimit(splitCommand(message)[1], parseInt(splitCommand(message)[2]));
				
				message.channel.send(channel.getLimitMessage(splitCommand(message)[1]));
			},
			defaultPermLevel: 3,
			possibleLengths: [2, 3]
		},
		"period" : {
			description: "If new time period is specified, change the tracking period of the specified type to that. Outputs current tracking period either way.",
			use: "<prefix>period [image|message] {<number>} {[seconds|minutes|hours]}",
			check: async function(message){
				const length = splitCommand(message).length;

				if (!["second", "seconds", "minute", "minutes", "hour", "hours"].includes(splitCommand(message)[3])) return {name: "CommandError", message: "That is not a valid time unit."}
				if (!["message", "image", "messages", "images"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
				if (length > 2 && isNaN(splitCommand(message)[2])) return {name: "CommandError", message: "Second argument must be a valid number"};

				return "Success";
			},
			exec: async function(message){
				const channel = fetchChannel(message);

				if (splitCommand(message).length === 4)  channel.changeTrackerPeriod(splitCommand(message)[1], parseTime(splitCommand(message)[2], splitCommand(message)[3]));
				
				message.channel.send(channel.getPeriodMessage(splitCommand(message)[1]));
			},
			defaultPermLevel: 3,
			possibleLengths: [2, 4]
		},
		"limits" : {
			description: "Informs the invoking user about their current limits in the channel they use this command",
			use: "<prefix>limits",
			aliases: ["showlimit", "showlimits"],
			check: async function(message){
				if (splitCommand(message).length > 1) return {name: "CommandError", message: "Too many arguments. Did you mean to use `=limit?`"};

				return "Success";
			},
			exec: async function(message){
				let constructedMessage = "Your limits on `" + message.channel.guild.name + " - #" + message.channel.name + "`: \n";

				if (selectTracker(message, "message").active){
					let tracker = selectTracker(message, "message");

					if (tracker.users[message.author.id]){
						constructedMessage += ("```You have posted " + tracker.users[message.author.id].sent + "/" + tracker.limit + " messages. \n");
						constructedMessage += ("You have " + makeReadable(getTimeRemaining(tracker, message.author.id)) + " remaining before your message limit reset \n");
					} else {
						constructedMessage += ("```You have posted 0/" + tracker.limit + " messages. \n");
					}
				} else {
					constructedMessage += ("```Messages are not being limited on this channel \n");
				}

				constructedMessage += "---\n";

				if (selectTracker(message, "image").active){
					let tracker = selectTracker(message, "image");

					if (tracker.users[message.author.id]){
						constructedMessage += ("You have posted " + tracker.users[message.author.id].sent + "/" + tracker.limit + " images. \n");
						constructedMessage += ("You have " + makeReadable(getTimeRemaining(tracker, message.author.id)) + " remaining before your image limit reset```");
					} else {
						constructedMessage += ("You have posted 0/" + tracker.limit + " images. ```");
					}
				} else {
					constructedMessage += ("Images are not being limited on this channel```");
				}

				message.author.send(constructedMessage);
			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		}
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: async function(message){
				return "Success";
			},
			exec: async function(message){
			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/

/* FUNCTIONS */
	function selectTracker(message, type){
		let channel = fetchChannel(message);

		switch(type){
			case "image":
			case "images":
				return channel.static.imageTracker;
				break;
			case "message":
			case "messages":
				return channel.static.messageTracker;
				break;
			default:
				throw {name: "CommandError", message: "Second argument must be either `image` or `message` depending on what type of tracking you wish to modify"};
				break;
		}
	}

		var embedMatcher = /\bhttp\S*/g;

	function performLimitChecks(message){
		if (message.author.id === config.ids.dev) return;

		const imageBool = selectTracker(message, "image").active;
		const messageBool = selectTracker(message, "message").active;

		if (message.content === (fetchServer(message).static.config.prefix + "limits")){
			message.delete();
			return;
		}
		//if (permissionLevelChecker(message.guild.fetchMember(message.author), message.guild.id)) /*|| message.guild.fetchMember(message.author).roles.some(role => role.name === 'Shining E-Peen')) */ return;
		

		if (message.attachments.size === 0){
			if (imageBool && URLCheck(message)){
				for(var i = 0; i < message.cleanContent.match(embedMatcher).length; i++) {
					 userSentMessage(message, selectTracker(message, "image"));
				}
			}
			else if (messageBool) userSentMessage(message, "message");
		} else {
			if (imageBool) userSentMessage(message, "image");
		}
	}

	/* performLimitChecks SUBFUNCTIONS */
		function URLCheck(message){
			return (selectTracker(message, "image").active 
				&& selectTracker(message, "image").trackLinks 
				&& message.cleanContent.match(embedMatcher));
		}

		function userSentMessage(message, tracker){
			if (fetchChannel(message).addSent(message.author.id, tracker)){
				//muteUser(message.author.id, message.channel.id, message.guild.id, tracker.type);
				message.delete();
				message.author.send(fetchChannel(message).getWarnMessage(tracker, message.author.id));
			}
		}

	function resetCheck(message){
		return (permissionLevelChecker(message.guild.member, message.guild.id)
			&& selectTracker(message, "message").active
			&& message.mentions.length === 1);
	}

global.performLimitChecks = performLimitChecks;
global.resetCheck = resetCheck;
global.selectTracker = selectTracker;

module.exports = slowmodeModule;