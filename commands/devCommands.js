/* IMPORTS */
const jsonfs = require('jsonfile');
jsonfs.spaces = 4;

const fs = require('fs');

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
		},
		"deleteChannel" : function(message){
			deleteChannel(message);
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

	function deleteChannel(message){
		channelDelete(message.channel);
	}

	function logMessage(message){
		const cont = message.content.substr(splitCommand(message)[0].length + 2);
		const cleancont = message.cleanContent.substr(splitCommand(message)[0].length + 2);

		console.log(`Content: ${cont}\nCleanContent: ${cleancont}`);
	}

/* HELPER */
	function channelDelete(channel){
		let channelStoreLocation = `/root/GhostBot/GhostBot/storage/deletedStore_${channel.name}_${Date.now()}.json`
		let channelStore = {};
		channel.fetchMessages().then(collection => {
			let messageArray = Array.from(collection.values());
			asyncMessageDelete(channel, messageArray, 0, channelStore, channelStoreLocation);
		});
	}

	function asyncMessageDelete(channel, messageArray, index, channelStore, channelStoreLocation){
		let msg = messageArray[index];
		if (!msg){
			console.log(`Array size: ${messageArray.length}\nindex: ${index}`);
			asyncMessageDeleteFinish(channel, channelStore, channelStoreLocation);
			return;
		} 
		channelStore[msg.id] = {
			"authorID": msg.author.id, 
			"authorName": msg.author.username, 
			"message": msg.cleanContent,
			"timestamp": msg.createdTimestamp,
		};
		console.log(`${msg.id} deleted`);
		msg.delete().then(x => {
			if (messageArray.length >= index){
				asyncMessageDelete(channel, messageArray, index + 1, channelStore, channelStoreLocation);
			} else {
				console.log(`Array size: ${messageArray.length}\nindex: ${index}`);
				asyncMessageDeleteFinish(channel, channelStore, channelStoreLocation)
			}
		});
	}

	function asyncMessageDeleteFinish(channel, channelStore, channelStoreLocation){
		jsonfs.writeFile(channelStoreLocation, channelStore, function(err){if(err) console.error(err);});
		channel.fetchMessages().then(collection => {if (collection.size > 0) channelDelete(channel)}).catch(console.error);
	}

module.exports = devCommands;