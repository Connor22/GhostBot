const administrationModule = {
	"mute" : {
		description: "Mute the mentioned user from the current channel, preventing them from sending messages",
		use: "<prefix>mute <userMention>",
		check: function(message){
			if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be muted per command"};
			
			return "Success";
		},
		exec: function(message){
			muteUser(message.mentions.users.first().id, message.channel.id, message.guild.id, true);
			log("mute", message);

			message.channel.sendMessage(`Muted ${message.mentions.users.first().username}`);
		},
		defaultPermLevel: 1,
		possibleLengths: [2]
	}
	"unmute" : {
		description: "Unmute the mentioned user from the current channel",
		use: "<prefix>unmute <userMention>",
		check: function(message){
			if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be muted per command"};
			
			return "Success";
		},
		exec: function(message){
			unmuteUser(message.mentions.users.first().id, message.channel.id, message.guild.id, true);
			log("unmute", message);

			message.channel.sendMessage(`Unmuted ${message.mentions.users.first().username}`);
		},
		defaultPermLevel: 1,
		possibleLengths: [2]
	},
	"ban" : {
		description: "Softbans the user, preventing them from chatting in any non-appeal channel.",
		use: "<prefix>ban <userMention>",
		check: function(message){
			if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be unbanned per command"};

			return "Success";
		},
		exec: function(message){
			const server = fetchServer(message);
			const userID = message.mentions.users.first().id;

			message.guild.members.get(userID).removeRole(message.guild.roles.find("name", server.static.modules.administration.roles.softban));
			message.channel.sendMessage("Unbanned <@" + userID + ">")//.then((message) => //message.delete(3000));

			server.getUser(userID).static.isBanned = false;

			log("unban", message);
			console.log("<@" + message.author.id + "> unbanned <@" + userID + ">");
		},
		defaultPermLevel: 2,
		possibleLengths: [2]
	},
	"unban" : {
		description: "Removes the softban from the mentioned user",
		use: "<prefix>ban <userMention>",
		check: function(message){
			if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be unbanned per command"};

			return "Success";
		},
		exec: function(message){
			const server = fetchServer(message);
			const userID = message.mentions.users.first().id;

			message.guild.members.get(userID).removeRole(message.guild.roles.find("name", server.static.modules.administration.roles.softban));
			message.channel.sendMessage("Unbanned <@" + userID + ">")//.then((message) => //message.delete(3000));

			server.getUser(userID).static.isBanned = false;

			log("unban", message);
			console.log("<@" + message.author.id + "> unbanned <@" + userID + ">");
		},
		defaultPermLevel: 2,
		possibleLengths: [2]
	},
	"open" : {
		description: "Allows users to chat in the channel. Requires proper setup.",
		use: "<prefix>open",
		aliases: ["openchannel", "openchat"],
		check: function(message){
			return "Success";
		},
		exec: function(message){
			message.channel.overwritePermissions(message.guild.roles.find("name", "@everyone"), {"SEND_MESSAGES": true});
			message.channel.sendMessage("Opened channel");
		},
		defaultPermLevel: 3,
		possibleLengths: [1]
	},
	"close" : {
		description: "Blocks users from chatting in the channel. Requires proper setup.",
		use: "<prefix>close",
		aliases: ["closechannel", "closechat"]
		check: function(message){
			return "Success";
		},
		exec: function(message){
			message.channel.overwritePermissions(message.guild.roles.find("name", "@everyone"), {"SEND_MESSAGES": false});
			message.channel.sendMessage("Closed channel");
		},
		defaultPermLevel: 3,
		possibleLengths: [1]
	}
}

for (let command in administrationModule){
	if (administrationModule[command].aliases){
		for (let i in administrationModule[command].aliases){
			administrationModule[administrationModule[command].aliases[i]] = administrationModule[command];
		}
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


module.exports = administrationModule;