const votingModule = {
	"propose" : {
		description: "Posts the proposal to be voted on",
		use: "<prefix>propose <proposal>",
		check: function(message){
			if (!fetchServer(message).getUser(message.author.id).takeToken()) return {name: "CommandError", message: `You don't have enough tokens for that.`}
			if (splitCommand(message).length === 1) return {name: "CommandError", message: `Please propose something.`};
			
			return "Success";
		},
		exec: function(message){
			const voteCount = fetchServer(message).getVoteNumber();

			const embed = new Discord.RichEmbed();
			embed.setAuthor(`Vote Proposal #${voteCount}`, "http://i.imgur.com/1MvehEj.png");
			embed.setDescription(stripCommand(message));
			embed.setFooter(`Vote proposed by ${message.author.username} | ID: ${message.author.id}`);
			embed.setTimestamp();

			const voteChannel = GhostBot.channels.get(fetchServer(message).static.modules.voting.voteChannels.input);
			
			voteChannel.send({"embed": embed})
			.then(newMsg => {
				fetchServer(message).addVote(stripCommand(message), newMsg.id, message.author.id, message.author.username, newMsg.channel.id, voteCount);
				newMsg.react(GhostBot.guilds.get(fetchServer(message).static.info.id).emojis.find("name", "Yes"));
				newMsg.react(GhostBot.guilds.get(fetchServer(message).static.info.id).emojis.find("name", "No"));
			})
			.catch(err => {
				console.error("Empty input vote");
			});
		},
		defaultPermLevel: 0,
		possibleLengths: [0]
	},
	"givetokens" : {
		description: "Gives the specified amount of tokens to the mentioned user.",
		use: "<prefix>givetokens <amount> <userMention>",
		check: function(message){
			if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can have tokens transferred to their account."};
			if (isNaN(amount)) return {name: "CommandError", message: "First argument must be a valid number."};
			if (parseInt(amount) < 0) return {name: "CommandError", message: "Amount must be above zero."};
			if (parseInt(amount) > fetchServer(message).getUser(message.author.id).getTokens()) return {name: "CommandError", message: "You don't have enough to do that!"};

			return "Success";
		},
		exec: function(message){
			fetchServer(message).getUser(message.mentions.users.first().id).addTokens(splitCommand(message)[1]);
			fetchServer(message).getUser(message.author.id).addTokens(`-${splitCommand(message)[1]}`);
		},
		defaultPermLevel: 0,
		possibleLengths: [3]
	},
	"tokens" : {
		description: "Informs the user of their token amount",
		use: "<prefix>tokens",
		check: function(message){
			return "Success";
		},
		exec: function(message){
			if (fetchServer(message).getUser(message.author.id).getTokens() === 1) message.reply(`You have ${fetchServer(message).getUser(message.author.id).getTokens()} vote proposal token remaining`);
			else message.reply(`You have ${fetchServer(message).getUser(message.author.id).getTokens()} vote proposal token remaining`);
		},
		defaultPermLevel: 0,
		possibleLengths: [1]
	},
	"togglevoting" : {
		description: "Toggles up/down votes on every message sent in the channel",
		use: "<prefix>togglevoting",
		check: function(message){
			return "Success";
		},
		exec: function(message){
			fetchChannel(message).togglePostVoting();
		},
		defaultPermLevel: 3,
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

module.exports = votingModule;