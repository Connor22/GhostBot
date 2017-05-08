/* CONSTANTS */
	const betweenPara = /\(([^)]+)\)/g;

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
		if (message.mentions.users.array().length != 1) throw  {name: "CommandError", message: "Only one user can be banned per command"};
		if (!checkBanUse(message.cleanContent)) throw {name: "CommandError", message: "Please refer to the documentation for =ban usage"};

		const regexMatch = message.cleanContent.match(betweenPara);

		const reason = regexMatch[0].substring(9, regexMatch[0].length - 1);
		const unparsedLength = regexMatch[1].substring(9, regexMatch[1].length - 1);
		const parsedLength = parseTime(unparsedLength.split(" ")[0], unparsedLength.split(" ")[1]);

		fetchServer(message).bannedUsers[message.mentions.users.first().id] = {length: parsedLength, timestamp: Date.now()}

		message.guild.members.get(message.mentions.users.first().id).addRole("256713025061519370");
		message.channel.sendMessage("Banned <@" + message.mentions.users.array()[0].id + ">")//.then((message) => //message.delete(3000));

		if (!fetchServer(message).bannedUsers) fetchServer(message).bannedUsers = [];
		fetchServer(message).bannedUsers.push(message.mentions.users.first().id);

		log("ban", message);
		console.log("<@" + message.author.id + "> banned <@" + message.mentions.users.array()[0].id + ">");
	}

	function unbanUser(message) {
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be unbanned per command"};

		unban(message.guild, message.mentions.users.first().id, "256713025061519370", message.author.id, message.channel);
	}

	function pruneUser(message) {
		throw {name: "CommandError", message: "Prune not yet fully implemented."};
	}

/* Sub Functions */
	function checkBanUse(content){
		var regexMatch = content.match(betweenPara);

		if (regexMatch.length != 2) return false;
		if (regexMatch[0].startsWith("(reason: ")) return false;
		if (regexMatch[1].startsWith("(length: ")) return false;

		return true;
	}

	function 

module.exports = modCommands;