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

		const server = fetchServer(message);
		const userID = message.mentions.users.first().id;

		message.guild.members.get(userID).addRole(server.static.roles.softban);
		message.channel.sendMessage("Banned <@" + userID + ">")//.then((message) => //message.delete(3000));

		server.users[userID].static.isBanned = true;

		log("ban", message);
		console.log("<@" + message.author.id + "> banned <@" + userID + ">");
	}

	function unbanUser(message) {
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be unbanned per command"};

		const server = fetchServer(message);
		const userID = message.mentions.users.first().id;

		message.guild.members.get(userID).removeRole(server.static.roles.softban);
		message.channel.sendMessage("Unbanned <@" + userID + ">")//.then((message) => //message.delete(3000));

		server.users[userID].static.isBanned = false;

		log("unban", message);
		console.log("<@" + message.author.id + "> unbanned <@" + userID + ">");
	}

	function pruneUser(message) {
		throw {name: "CommandError", message: "Prune not yet fully implemented."};
	}

module.exports = modCommands;