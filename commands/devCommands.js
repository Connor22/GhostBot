/* DICTIONARIES */
	const devCommands = {
		"clearChannels" : function(message){
			debugClearChannels(message);
		},
		"changeusername" : function(message){
			changeUserName(message);
		},
		"changeavatar" : function(message){
			changeAvatar(message);
		},
		"log" : function(message){
			logMessage(message);
		}
	}

/* FUNCTIONS */
	function debugClearChannels(message){
		if (message.content.indexOf(config.strings.PIN) > -1){
			serverStore = {};
			message.reply("Channel store obliterated.")
		} else {
			throw {name: "OtherError", message: "Invalid PIN. Are you posting this in a public channel?"};
		}
	}

	function changeUserName(message){
		GhostBot.user.setUsername(message.content.split(" ")[1]);
	}

	function changeAvatar(message){
		GhostBot.user.setAvatar(message.content.split(" ")[1]);
	}

	function logMessage(message){
		const cont = message.content.substr(splitCommand(message)[0].length + 2);
		const cleancont = message.cleanContent.substr(splitCommand(message)[0].length + 2);

		console.log(`Content: ${cont}\nCleanContent: ${cleancont}`);
	}

module.exports = devCommands;