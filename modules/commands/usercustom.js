/* COMMAND OBJECTS */
	const usercustomizationModule = {
		"hide" : {
			description: "Hides the specified channel, removing the invokers ability to see it at all",
			use: "<prefix>hide [<channelName>|<channelMention>]",
			check: function(message, channel, server){
				let channelName = GhostBot.splitCommand(message, server)[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);

				if (!(message.guild.channels.exists("name", channelName))) return {name: "OtherError", message: `Cannot find channel \`${channelName}\``};

				return "Success";
			},
			exec: function(message, channel, server){
				let channelName = GhostBot.splitCommand(message, server)[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);

				message.guild.channels.find("name", channelName).overwritePermissions(message.author, {READ_MESSAGES: false});
			
				message.delete(5000);
			},
			response: function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"show" : {
			description: "Shows the specified channel, enabling the invoker to see it",
			use: "<prefix>show [<channelName>|<channelMention>]",
			check: function(message, channel, server){
				let channelName = GhostBot.splitCommand(message, server)[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);
				
				if (!(message.guild.channels.exists("name", channelName))) return {name: "OtherError", message: `Cannot find channel \`${channelName}\``};
				if (!message.guild.channels.find("name", channelName).permissionOverwrites.has(message.author.id) 
					&& !(server.isChannelShowable(message.guild.channels.find("name", channelName).id))) return {name: "OtherError", message: `That channel doesn't seem to be joinable`};

				return "Success";
			},
			exec: function(message, channel, server){
				let channelName = GhostBot.splitCommand(message, server)[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);

				const showChannel = message.guild.channels.find("name", channelName)

				if (!(showChannel.permissionOverwrites.has(message.author.id))){
					showChannel.overwritePermissions(message.author, {READ_MESSAGES: true});
				} else {
					showChannel.overwritePermissions(message.author, {READ_MESSAGES: true});
				}

				message.delete(5000);
			},
			response: function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"join" : {
			description: "Joins the specified role if it's joinable",
			use: "<prefix>join <role>",
			check: function(message, channel, server){
				const role = message.guild.roles.find("name", GhostBot.splitCommand(message, server)[1]);
				if (!role) return {name: "CommandError", message: "That role doesn't exist."};
				if (!server.isRoleJoinable(role.id)) return {name: "OtherError", message: "That role is not joinable."};
				if (!message.member) return {name: "OtherError", message: "You need to go online to use this command"};

				return "Success";
			},
			exec: function(message, channel, server){
				const role = message.guild.roles.find("name", GhostBot.splitCommand(message, server)[1]);
				message.member.addRole(message.guild.roles.find("name", role.name));
			},
			response: function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"leave" : {
			description: "Leaves the specified role if it's joinable",
			use: "<prefix>leave <role>",
			check: function(message, channel, server){
				const role = message.guild.roles.find("name", GhostBot.splitCommand(message, server)[1]);
				if (!role) return {name: "CommandError", message: "That role doesn't exist."};
				if (!server.isRoleJoinable(role.id)) return {name: "OtherError", message: "That role is not joinable."};
				if (!message.member) return {name: "OtherError", message: "You need to go online to use this command"};

				return "Success";
			},
			exec: function(message, channel, server){
				const role = message.guild.roles.find("name", GhostBot.splitCommand(message, server)[1]);
				message.member.removeRole(message.guild.roles.find("name", role.name));
			},
			response: function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"makeshowable" : {
			description: "Makes the current channel able to be joined through the show command",
			use: "<prefix>makejoinable",
			check: function(message, channel, server){
				return "Success";
			},
			exec: function(message, channel, server){
				server.modules.usercustom.joinables.channels.addToSet(message.channel.id);
			},
			response: function(message, channel, server){
				return;
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
		"joinablerole" : {
			description: "Makes the mentioned role joinable through the join command",
			use: "<prefix>ping",
			check: function(message, channel, server){
				if (!message.mentions.roles.first()) return {name: "CommandError", message: "Please mention a role"};

				return "Success";
			},
			exec: function(message, channel, server){
				server.defineJoinableRole(message.mentions.roles.first().id);

				return;
			},
			response: function(message, channel, server){
				return `The role \<@&${message.mentions.roles.first().id}\> is now joinable `;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: function(message, channel, server){
				return "Success";
			},
			exec: function(message, channel, server){
			},
			response: function(message, channel, server){
			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/

module.exports = usercustomizationModule;