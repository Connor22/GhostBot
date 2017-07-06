const usercustomizationModule = {
	"hide" : {
		description: "Hides the specified channel, removing the invokers ability to see it at all",
		use: "<prefix>hide [<channelName>|<channelMention>]",
		check: function(message){
			let channelName = splitCommand(message)[1];
			if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;

			if (!(message.guild.channels.exists("name", channelName))) return {name: "OtherError", message: `Cannot find channel \`${channelName}\``};
			if (message.guild.channels.find("name", channelName) === message.guild.defaultChannel) return {name: "OtherError", message: `\`${channelName}\` is the default channel of this server and cannot be hidden.`};

			return "Success";
		},
		exec: function(message){
			let channelName = splitCommand(message)[1];
			if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;

			message.guild.channels.find("name", channelName).overwritePermissions(message.author, {READ_MESSAGES: false});
		
			message.delete(5000);
		},
		defaultPermLevel: 0,
		possibleLengths: [2]
	},
	"show" : {
		description: "Shows the specified channel, enabling the invoker to see it",
		use: "<prefix>show [<channelName>|<channelMention>]",
		check: function(message){
			let channelName = splitCommand(message)[1];
			if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;

			if (!(message.guild.channels.exists("name", channelName))) return {name: "OtherError", message: `Cannot find channel \`${channelName}\``};
			if (!message.guild.channels.find("name", channelName).permissionOverwrites.has(message.author.id) 
				&& !(channelName in fetchServer(message).static.usercustom.joinables.channels)) return {name: "OtherError", message: `That channel doesn't seem to be joinable`};

			return "Success";
		},
		exec: function(message){
			let channelName = splitCommand(message)[1];
			if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;

			const channel = message.guild.channels.find("name", channelName)

			if (!(channel.permissionOverwrites.has(message.author.id))){
				channel.overwritePermissions(message.author, {READ_MESSAGES: true});
			} else {
				channel.overwritePermissions(message.author, {READ_MESSAGES: true});
			}

			message.delete(5000);
		},
		defaultPermLevel: 0,
		possibleLengths: [2]
	},
	"join" : {
		description: "Joins the specified role if it's joinable",
		use: "<prefix>join <role>",
		check: function(message){
			if (splitCommand(message).length != 2) return {name: "CommandError", message: "You can only join one role per command."};
			if (!(fetchServer(message).static.usercustom.joinables.roles[splitCommand(message)[1]])) return {name: "OtherError", message: "That role either doesn't exist or is not joinable by users."};
			if (!message.member) return {name: "OtherError", message: "You need to go online to use this command"};

			return "Success";
		},
		exec: function(message){
			message.member.addRole(message.guild.roles.find("name", roleName));
		},
		defaultPermLevel: 0,
		possibleLengths: [2]
	},
	"leave" : {
		description: "Leaves the specified role if it's joinable",
		use: "<prefix>leave <role>",
		check: function(message){
			if (splitCommand(message).length != 2) return {name: "CommandError", message: "You can only join one role per command."};
			if (!(fetchServer(message).static.usercustom.joinables.roles[splitCommand(message)[1]])) return {name: "OtherError", message: "That role either doesn't exist or is not joinable by users."};
			if (!message.member) return {name: "OtherError", message: "You need to go online to use this command"};

			return "Success";
		},
		exec: function(message){
			message.member.removeRole(message.guild.roles.find("name", roleName));
		},
		defaultPermLevel: 0,
		possibleLengths: [2]
	},
	"makejoinable" : {
		description: "Makes the current channel able to be joined through the `join` command",
		use: "<prefix>makejoinable",
		check: function(message){
			return "Success";
		},
		exec: function(message){
			fetchServer(message).static.usercustom.joinables.channels[message.channel.id] = message.channel.id;
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

module.exports = usercustomizationModule;