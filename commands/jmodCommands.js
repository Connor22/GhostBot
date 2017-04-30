/* DICTIONARIES */
	const jmodCommands = {
		"mute" : function(message){
			commandMuteUser(message);
		},
		"unmute" : function(message){
			commandUnmuteUser(message);
		}
	}

/* FUNCTIONS */
	function commandMuteUser(message) {
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be muted per command"};

		muteUser(message.mentions.users.first().id, message.channel.id, message.guild.id, true);
		log("mute", message);

		message.channel.sendMessage(`Muted ${message.mentions.users.first().username}`);
	}

	function commandUnmuteUser(message) {
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be unmuted per command"};

		unmuteUser(message.mentions.users.first().id, message.channel.id, message.guild.id, true);
		log("unmute", message);

		message.channel.sendMessage(`Unmuted ${message.mentions.users.first().username}`);
	}

module.exports = jmodCommands;