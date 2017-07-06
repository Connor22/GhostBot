const slowmodeModule = {
	"stoplimit" : {
		description: "Stops the limiting of the specified type of message in the current channel",
		use: "<prefix>stoplimit [image|message]",
		check: function(message){
			if (!["message", "image"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
			if (!selectTracker(message, splitCommand(message)[1]).active) return {name: "CommandError", message: "Monitoring for " + splitCommand(message)[1] +" is already disabled"};

			return "Success";
		},
		exec: function(message){
			const tracker = selectTracker(message, splitCommand(message)[1]);

			message.channel.sendMessage(capitalizeFirstLetter(tracker.type) + " limiting disabled on this channel.");				
			fetchChannel(message).toggleTracker(tracker.type);
		},
		defaultPermLevel: 3,
		possibleLengths: [2]
	},
	"stoplimit" : {
		description: "Starts the limiting of the specified type of message in the current channel",
		use: "",
		check: function(message){
			if (!["message", "image"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
			if (selectTracker(message, splitCommand(message)[1]).active) return {name: "CommandError", message: "Monitoring for " + splitCommand(message)[1] +" is already enabled"};

			return "Success";
		},
		exec: function(message){
			const tracker = selectTracker(message, splitCommand(message)[1]);

			fetchChannel(message).toggleTracker(tracker.type);
			message.channel.sendMessage(capitalizeFirstLetter(tracker.type) + " limiting enabled on this channel.");
		},
		defaultPermLevel: 3,
		possibleLengths: [2]
	},
	"resetlimit" : {
		description: "Resets the mentioned user's limit for the specific type of limiting",
		use: "",
		check: function(message){
			if (!["message", "image"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
			if (message.mentions.users.array().length < 1) return {name: "CommandError", message: "Need to mention one user"};

			return "Success";
		},
		exec: function(message){
			fetchChannel(message).resetTracker(message.mentions.users.array()[0].id, splitCommand(message)[1]);
		},
		defaultPermLevel: 2,
		possibleLengths: [3]
	}, 
	"limit" : {
		description: "If new limit is specified, change the message limit of the specified type to that. Outputs current limit either way.",
		use: "<prefix>limit [image|message] {<number>}",
		check: function(message){
			const length = splitCommand(message).length;

			if (!["message", "image"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
			if (length > 1 && isNaN(splitCommand(message)[2])) return {name: "CommandError", message: "Second argument must be a valid number"};

			return "Success";
		},
		exec: function(message){
			if (splitCommand(message).length === 3) channel.changeTrackerLimit(splitCommand(message)[1], parseInt(splitCommand(message)[2]));
			
			message.channel.sendMessage(channel.getLimitMessage(splitCommand(message)[1]));
		},
		defaultPermLevel: 3,
		possibleLengths: [1, 4]
	},
	"period" : {
		description: "If new time period is specified, change the tracking period of the specified type to that. Outputs current tracking period either way.",
		use: "<prefix>period [image|message] {<number>} {[seconds|minutes|hours]}",
		check: function(message){
			const length = splitCommand(message).length;

			if (!["message", "image"].includes(splitCommand(message)[1])) return {name: "CommandError", message: "Need to specify either image or message limiting"};
			if (length > 1 && isNaN(splitCommand(message)[2])) return {name: "CommandError", message: "Second argument must be a valid number"};

			return "Success";
		},
		exec: function(message){
			if (splitCommand(message).length === 4)  channel.changeTrackerPeriod(splitCommand(message)[1], parseTime(splitCommand(message)[2], splitCommand(message)[3]));
			
			message.channel.sendMessage(channel.getPeriodMessage(splitCommand(message)[1]));
		},
		defaultPermLevel: 3,
		possibleLengths: [1, 4]
	},
	"limits" : {
		description: "Informs the invoking user about their current limits in the channel they use this command",
		use: "<prefix>limits",
		aliases: ["showlimit", "showlimits"],
		check: function(message){
			if (splitCommand(message).length > 1) return {name: "CommandError", message: "Too many arguments. Did you mean to use `=limit?`"};

			return "Success";
		},
		exec: function(message){
			let constructedMessage = "Your limits on `" + message.channel.guild.name + " - #" + message.channel.name + "`: \n";
					
			if (selectTracker(message, "message").active){
				let tracker = selectTracker(message, "message");

				if (tracker.users[message.author.id]){
					constructedMessage += ("```You have posted " + tracker.users[message.author.id].sent + "/" + tracker.limit + " messages. \n");
					constructedMessage += ("You have " + makeReadable(fetchChannel(message).getTimeRemaining(tracker, message.author.id)) + " remaining before your message limit reset \n");
				} else {
					constructedMessage += ("```You have posted 0/" + tracker.limit + " messages. \n");
				}
			} else {
				constructedMessage += ("```Messages are not being limited on this channel \n");
			}

			constructedMessage += "---\n";

			if (selectTracker(message, "image").isActive()){
				let tracker = selectTracker(message, "image");
				let user = tracker.getUser(message.author.id);
				if (user){
					constructedMessage += ("You have posted " + tracker.users[message.author.id].sent + "/" + tracker.limit + " images. \n");
					constructedMessage += ("You have " + makeReadable(fetchChannel(message).getTimeRemaining(tracker, message.author.id)) + " remaining before your image limit reset```");
				} else {
					constructedMessage += ("You have posted 0/" + tracker.limit + " images. ```");
				}
			} else {
				constructedMessage += ("Images are not being limited on this channel```");
			}

			message.author.sendMessage(constructedMessage);
		},
		defaultPermLevel: 0,
		possibleLengths: [1]
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
		defaultPermLevel: 0,
		possibleLengths: []
	}

*/

module.exports = slowmodeModule;