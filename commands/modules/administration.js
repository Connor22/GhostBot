/* COMMAND OBJECTS */
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
		},
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
				if (fetchServer(message).getUser(message.mentions.users.first().id).static.modules.administration.isBanned) return {name: "CommandError", message: "That user is already banned"};
				return "Success";
			},
			exec: function(message){
				const server = fetchServer(message);
				const userID = message.mentions.users.first().id;

				message.guild.members.get(userID).addRole(message.guild.roles.find("name", server.static.modules.administration.roles.softban));
				message.channel.sendMessage("Banned <@" + userID + ">")//.then((message) => //message.delete(3000));

				server.getUser(userID).static.modules.administration.isBanned = true;

				log("ban", message);
				console.log("<@" + message.author.id + "> banned <@" + userID + ">");
			},
			defaultPermLevel: 2,
			possibleLengths: [2]
		},
		"unban" : {
			description: "Removes the softban from the mentioned user",
			use: "<prefix>ban <userMention>",
			check: function(message){
				if (message.mentions.users.array().length != 1) return {name: "CommandError", message: "Only one user can be unbanned per command"};
				if (!fetchServer(message).getUser(message.mentions.users.first().id).static.modules.administration.isBanned) return {name: "CommandError", message: "That user is not banned"};
				return "Success";
			},
			exec: function(message){
				const server = fetchServer(message);
				const userID = message.mentions.users.first().id;

				message.guild.members.get(userID).removeRole(message.guild.roles.find("name", server.static.modules.administration.roles.softban));
				message.channel.sendMessage("Unbanned <@" + userID + ">")//.then((message) => //message.delete(3000));

				server.getUser(userID).static.modules.administration.isBanned = false;

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
			aliases: ["closechannel", "closechat"],
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

/* FUNCTIONS */
	function log(type, message){
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

		message.guild.channels.get(fetchServer(message).static.modules.administration.logChannel).sendMessage("", embd);
	}

	function muteUser(userID, channelID, serverID, command) {
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

	function unmuteUser(userID, channelID, serverID, command){
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


global.muteUser = muteUser;
global.unmuteUser = unmuteUser;
global.log = log;

module.exports = administrationModule;