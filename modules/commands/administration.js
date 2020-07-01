/* COMMAND OBJECTS */
	const administrationModule = {
		"mute" : {
			description: "Mute the mentioned user from the current channel, preventing them from sending messages",
			use: "<prefix>mute <userMention>",
			check: async function(message, channel, server){
				if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be muted per command"};
				
				return "Success";
			},
			exec: async function(message, channel, server){
				muteUser(message.mentions.users.first().id, message.channel.id, message.guild.id, true);
			},
			response: async function(message, channel, server){
				//log("mute", message);
				return `Muted ${message.mentions.users.first().username}`;
			},
			defaultPermLevel: 1,
			possibleLengths: [2]
		},
		"unmute" : {
			description: "Unmute the mentioned user from the current channel",
			use: "<prefix>unmute <userMention>",
			check: async function(message, channel, server){
				if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be muted per command"};
				
				return "Success";
			},
			exec: async function(message, channel, server){
				unmuteUser(message.mentions.users.first().id, message.channel.id, message.guild.id, true);
			},
			response: async function(message, channel, server){
				//log("unmute", message);
				return `Unmuted ${message.mentions.users.first().username}`;
			},
			defaultPermLevel: 1,
			possibleLengths: [2]
		},
		"ban" : {
			description: "Softbans the user, preventing them from chatting in any non-appeal channel.",
			use: "<prefix>ban <userMention>",
			check: async function(message, channel, server){
				if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be unbanned per command"};
				if (server.isUserBanned(message.mentions.users.first().id)) return {name: "CommandError", message: "That user is already banned"};
				return "Success";
			},
			exec: async function(message, channel, server){
				const user = await message.guild.members.get(message.mentions.users.first().id)
				user.addRole(server.modules.administration.roles.softban).catch(console.log);

				server.ban(message.mentions.users.first().id);
			},
			response: async function(message, channel, server){
				//log("ban", message);
				console.log("<@" + message.author.id + "> banned <@" + message.mentions.users.first().id + ">");

				return (`Banned <@${message.mentions.users.first().id}>`);
			},
			defaultPermLevel: 2,
			possibleLengths: [2]
		},
		"unban" : {
			description: "Removes the softban from the mentioned user",
			use: "<prefix>ban <userMention>",
			check: async function(message, channel, server){
				if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be unbanned per command"};
				if (!server.isUserBanned(message.mentions.users.first().id)) return {name: "CommandError", message: "That user is not banned"};
				return "Success";
			},
			exec: async function(message, channel, server){
				const user = await message.guild.members.get(message.mentions.users.first().id)
				user.removeRole(server.modules.administration.roles.softban).catch(console.log);

				server.unban(message.mentions.users.first().id);
			},
			response: async function(message, channel, server){
				//log("unban", message);
				console.log("<@" + message.author.id + "> unbanned <@" + message.mentions.users.first().id + ">");

				return (`Unbanned <@${message.mentions.users.first().id}>`);
			},
			defaultPermLevel: 2,
			possibleLengths: [2]
		},
		"open" : {
			description: "Allows users to chat in the channel. Requires proper setup.",
			use: "<prefix>open",
			aliases: ["openchannel", "openchat"],
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				message.channel.overwritePermissions(message.guild.roles.find(role => role.name  === "@everyone"), {"SEND_MESSAGES": true});
				message.channel.send("Opened channel");
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
		"close" : {
			description: "Blocks users from chatting in the channel. Requires proper setup.",
			use: "<prefix>close",
			aliases: ["closechannel", "closechat"],
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				message.channel.overwritePermissions(message.guild.roles.find(role => role.name  === "@everyone"), {"SEND_MESSAGES": false});
				message.channel.send("Closed channel");
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
		"banrole" : {
			description: "Defines the role that the ban command will use",
			use: "<prefix>banrole <role mention>",
			check: async function(message, channel, server){
				if (!message.mentions.roles.first()) return {name: "CommandError", message: "Please mention a role"};

				return "Success";
			},
			exec: async function(message, channel, server){
				server.defineBanRole(message.mentions.roles.first().id);

				return;
			},
			response: async function(message, channel, server){
				return `The banrole is now \<@&${server.modules.administration.roles.softban}\>`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"adminrole" : {
			description: "Defines the role for Administrators",
			use: "<prefix>adminrole <role mention>",
			check: async function(message, channel, server){
				if (!message.mentions.roles.first()) return {name: "CommandError", message: "Please mention a role"};

				return "Success";
			},
			exec: async function(message, channel, server){
				server.defineAdminRole(message.mentions.roles.first().id);

				return;
			},
			response: async function(message, channel, server){
				return `The admin role is now \<@&${server.modules.administration.roles.admin.id}\>`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"modrole" : {
			description: "Defines the role for Moderators",
			use: "<prefix>modrole <role mention>",
			check: async function(message, channel, server){
				if (!message.mentions.roles.first()) return {name: "CommandError", message: "Please mention a role"};

				return "Success";
			},
			exec: async function(message, channel, server){
				server.defineModRole(message.mentions.roles.first().id);

				return;
			},
			response: async function(message, channel, server){
				return `The mod role is now \<@&${server.modules.administration.roles.mod.id}\>`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"jmodrole" : {
			description: "Defines the role for Junior Moderators",
			use: "<prefix>jmodrole <role mention>",
			check: async function(message, channel, server){
				if (!message.mentions.roles.first()) return {name: "CommandError", message: "Please mention a role"};

				return "Success";
			},
			exec: async function(message, channel, server){
				server.defineJModRole(message.mentions.roles.first().id);

				return;
			},
			response: async function(message, channel, server){
				return `The junior mod role is now \<@&${server.modules.administration.roles.jmod.id}\>`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
	}


/* Default Command

	"" : {
		description: "",
		use: "",
		check: async function(message, channel, server){
			return "Success";
		},
		exec: async function(message, channel, server){
		},
		defaultPermLevel: 0,
		possibleLengths: []
	}

*/

/* FUNCTIONS */
	function log(type, message, logChannel){
		let embd = {embed: {}};
		embd.embed.author = {}
		embd.embed.timestamp = new Date();

		let mentionID = message.mentions.users.first().id;

		switch (type){
			case "mute":
				embd.embed.description  = `<@${message.author.id}> muted <@${mentionID}> from ${message.channel.name}`;
				embd.embed.author.icon_url = "http://i.imgur.com/sPHnAIJ.png";
				embd.embed.author.name = `Mute ${mentionID}`;
				embd.embed.color = 16744448;
				break;
			case "unmute":
				embd.embed.description  = `<@${message.author.id}> unmuted <@${mentionID}> from ${message.channel.name}`;
				embd.embed.author.icon_url = "http://i.imgur.com/sPHnAIJ.png";
				embd.embed.author.name = `Unmute ${mentionID}`;
				embd.embed.color = 16744448;
				break;	
			case "ban":
				embd.embed.description = `<@${message.author.id}> banned <@${mentionID}>`;
				embd.embed.author.icon_url = "http://i.imgur.com/1MvehEj.png";
				embd.embed.author.name = `Ban ${mentionID}`;
				embd.embed.color = 16711680;
				break;
			case "unban":
				embd.embed.description  = `<@${message.author.id}> unbanned <@${mentionID}>`;
				embd.embed.author.icon_url = "http://i.imgur.com/1MvehEj.png";
				embd.embed.author.name = `Unban ${mentionID}`;
				embd.embed.color = 16711680;
				break;
		}

		logChannel.send("", embd);
	}

	async function muteUser(userID, channelID, serverID, command) {
		const server = GhostBot.guilds.get(serverID);
		const user = server.members.get(userID);
		const channel = server.channels.get(channelID);

		let roleName = `Mute - ${channel.name}`;
		if (!command) roleName = `AutoMute - ${channel.name}`;

		if (server.roles.exists('name', roleName)){
			user.addRole(server.roles.find('name', roleName));
		} else {
			server.createRole({name: roleName, permissions: []})
			.then((role) => {
				channel.overwritePermissions(role, {SEND_MESSAGES: false, ADD_REACTIONS: false});
				user.addRole(role);
			});
		}
	}

	async function unmuteUser(userID, channelID, serverID, command){
		const server = GhostBot.guilds.get(serverID);
		const user = server.members.get(userID);
		const channel = server.channels.get(channelID);

		let roleName = `Mute - ${channel.name}`;
		if (!command) roleName = `AutoMute - ${channel.name}`;

		if (!(user && channel && server)) console.log(`user: ${user}\nserver: ${server}\nchannel: ${channel}\n`)
		if (!server.roles.find('name', roleName)) {
			return;
		}

		user.removeRole(server.roles.find('name', roleName));
	}

module.exports = administrationModule;