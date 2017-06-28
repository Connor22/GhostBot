/* DICTIONARIES */
	const modCommands = {
		"ban": function(message) {
			banUser(message);
		},
		"unban": function(message) {
			unbanUser(message);
		},
		"prune": function(message) {
			pruneUser(message);
		}
	}

/* FUNCTIONS */
	function banUser(message){
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be banned per command"};

		message.guild.members.get(message.mentions.users.first().id).addRole("256713025061519370");
		message.channel.sendMessage("Banned <@" + message.mentions.users.array()[0].id + ">")//.then((message) => //message.delete(3000));

		if (!fetchServer(message).bannedUsers) fetchServer(message).bannedUsers = [];
		fetchServer(message).bannedUsers.push(message.mentions.users.first().id);

		log("ban", message);
		console.log("<@" + message.author.id + "> banned <@" + message.mentions.users.array()[0].id + ">");
	}

	function unbanUser(message) {
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be unbanned per command"};

		message.guild.members.get(message.mentions.users.first().id).removeRole("256713025061519370");
		message.channel.sendMessage("Unbanned <@" + message.mentions.users.array()[0].id + ">")//.then((message) => //message.delete(3000));

		fetchServer(message).bannedUsers.splice(fetchServer(message).bannedUsers.indexOf(message.mentions.users.first().id), 1);

		log("unban", message);
		console.log("<@" + message.author.id + "> unbanned <@" + message.mentions.users.array()[0].id + ">");
	}

	function pruneUser(message) {
		throw {name: "CommandError", message: "Prune not yet fully implemented."};
	}

module.exports = modCommands;