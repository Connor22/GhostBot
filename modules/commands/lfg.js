/* COMMAND OBJECTS */
	const lfgModule = {
		"lfg" : {
			description: "Joins a specific channel, and pings that channel to alert others that you are looking to play that game.",
			use: "<prefix>lfg <game>",
			check: async function(message, channel, server){
				
				if (!server.modules.lfg.getGame(message.split[1])) return {name: "CommandError", message: "That game is not yet added, or you misspelled it."};

				return "Success";
			},
			exec: async function(message, channel, server){
				const game = server.modules.lfg.getGame(message.split[1]);
				const gameRole = message.guild.roles.get(game.role);

				message.member.addRole(game.role).catch(console.log).then();

				gameRole.setMentionable(true).then(message.guild.channels.get(game.channel).send(`<@&${game.role}>: <@${message.author.id}> is looking to play!`).then(gameRole.setMentionable(false)));

				return;
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"nolfg" : {
			description: "Leaves all lfg channels and roles.",
			use: "<prefix>nolfg",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				for (let game in server.modules.lfg.games){
					message.member.removeRole(message.guild.roles.get(server.modules.lfg.getGame(game).role));
				}
				return;
			},
			response: async function(message, channel, server){
				return "Successfully left all lfg channels.";
			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		},
		"addlfggame" : {
			description: "Adds a game to the LFG roster",
			use: "<prefix>addlfggame <game> <channelID> <roleID>",
			check: async function(message, channel, server){
				
				if (!message.guild.channels.get(message.split[2])) return {name: "CommandError", message: "Second argument must be a valid channel ID."};
				if (!message.guild.roles.get(message.split[3])) return {name: "CommandError", message: "Third argument must be a valid role ID."};

				return "Success";
			},
			exec: async function(message, channel, server){
				
				server.modules.lfg.addGame(message.split[1], server, message.split[2], message.split[3]);

				return;
			},
			response: async function(message, channel, server){
				return `Added ${message.split[1]} to lfg`;
			},
			defaultPermLevel: 3,
			possibleLengths: [4]
		},
		"deletelfggame" : {
			description: "Removes a game from the LFG roster",
			use: "<prefix>deletelfggame <game>",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				
				server.modules.lfg.removeGame(message.split[1], server);

				return;
			},
			response: async function(message, channel, server){
				return `Removed ${message.split[1]} from lfg`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
	}

module.exports = lfgModule;