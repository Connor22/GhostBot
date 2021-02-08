/* COMMAND OBJECTS */
	const archivalModule = {
		"archive" : {
			description: "Archive the channel, starting from the given message ID",
			use: "<prefix>archive <messageID>",
			check: async function(message, channel, server){
				
				if (splitCommand.length === 2 && !message.channel.messages.fetch(message.split[1])) return {name: "CommandError", message: "Argument must be a valid message ID."};
				return "Success";
			},
			exec: async function(message, channel, server){
				
				channel.archive(message, message.split[1]);
				return;
			},
			response: async function(message, channel, server){
				return "Started archiving process";
			},
			defaultPermLevel: 3,
			possibleLengths: [1, 2]
		}
	}

module.exports = archivalModule;