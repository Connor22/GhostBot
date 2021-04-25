/* COMMAND OBJECTS */
	const starboardModule = {
		"setpinchannel" : {
			description: "Sets a channel as the starboard for a specific category. Also enables starring for that category.",
			use: "=setPinChannel <categoryID> <pinChannelID>",
			check: async function(message, channel, server){
				

				if (!message.guild.channels.cache.get(message.split[1]) || !message.guild.channels.cache.get(message.split[2])) return {name: "CommandError", message: "One of the provided ids is not a valid channel ID."};

				return "Success";
			},
			exec: async function(message, channel, server){
				

				server.modules.starboard.createStarCategory(message.split[1], message.split[2]);
				server.markModified(`modules.starboard.categories`);

				return;
			},
			response: async function(message, channel, server){
				return "Added starboard!";
			},
			defaultPermLevel: 3,
			possibleLengths: [3]
		},
		"starthreshold" : {
			description: "Defines the star threshold for the server.",
			use: "=starthreshold <number>",
			check: async function(message, channel, server){
				

				//if (!message.guild.channels.cache.get(message.split[1]) || !message.guild.channels.cache.get(message.split[2])) return {name: "CommandError", message: "One of the provided ids is not a valid channel ID."};

				return "Success";
			},
			exec: async function(message, channel, server){
				

				server.modules.starboard.starThreshold = message.split[1];
				server.markModified(`modules.starboard.starThreshold`);

				return;
			},
			response: async function(message, channel, server){
				return `Star threshold is now ${message.split[1]}`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"stareverything" : {
			description: "Tells the bot to star all media in channels that don't start with x-",
			use: "=stareverything",
			check: async function(message, channel, server){
				

				return "Success";
			},
			exec: async function(message, channel, server){
				server.modules.starboard.starEverything = !server.modules.starboard.starEverything;

				return;
			},
			response: async function(message, channel, server){
				return `Starring all media has been toggled.`;
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
	}

module.exports = starboardModule;