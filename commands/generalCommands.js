/* DICTIONARIES */
	const generalCommands = {
		"limits" : function(message){
			informUserOfHisLimits(message);
		},
		"hiddenchannels" : function(message) {
			informUserOfHiddenChannels(message);
		},
		"join" : function(message) {
			joinChannel(message);
		},
		"leave" : function(message) {
			leaveChannel(message);
		},
		"hide" : function(message) {
			hideChannel(message);
		},
		"show" : function(message) {
			showChannel(message);
		},
		"ping" : function(message){
			ping(message);
		}, 
		"permissionlevel" : function(message){
			permissionLevelReporter(message);
		},
		"rules" : function(message){
			sendChannelRules(message);
		},
		"channelrules" : function(message){
			sendChannelRules(message);
		},
		"globalrules" : function(message){
			sendGlobalRules(message);
		},
		"serverrules" : function(message){
			sendGlobalRules(message);
		},
	};

/* FUNCTIONS */
	function informUserOfHisLimits(message) {
		let constructedMessage = "Your limits on `" + message.channel.guild.name + " - #" + message.channel.name + "`: \n";
					
		if (selectTracker(message, "message").isActive()){
			let tracker = selectTracker(message, "message");
			let user = tracker.getUser(message.author.id);
			if (user){
				constructedMessage += ("```You have posted " + user.getSentAmount() + "/" + tracker.limit + " messages. \n");
				constructedMessage += ("You have " + makeReadable(user.getTimeRemaining(), tracker.period)+ " remaining before your message limit reset \n");
			} else {
				constructedMessage += ("```You have posted 0/" + tracker.limit + " messages. \n");
			}
		} else {
			constructedMessage += ("```Messages are not being limited on this channel \n");
		}

		constructedMessage += "---\n";

		if (selectTracker(message, "image").isActive()){
			let tracker = selectTracker(message, "image");
			let user = tracker.getUser(message.author.id);
			if (user){
				constructedMessage += ("You have posted " + user.getSentAmount() + "/" + tracker.limit + " images. \n");
				constructedMessage += ("You have " + makeReadable(user.getTimeRemaining()) + " remaining before your image limit reset```");
			} else {
				constructedMessage += ("You have posted 0/" + tracker.limit + " images. ```");
			}
		} else {
			constructedMessage += ("Images are not being limited on this channel```");
		}

		message.author.sendMessage(constructedMessage);
	}

	function informUserOfHiddenChannels(message) {
		const hiddens = fetchServer(message).hiddens;
		let returnString = "List of Hidden Channels: \n Type `=join <channel>` to join \n Type `=leave <channel>` to leave \n```\n";
		for (let i = hiddens.length - 1; i >= 0; i--) {
			returnString += hiddens[i] + "\n";
		}
		returnString += "\n```";

		message.channel.sendMessage(returnString);
	}

	function joinChannel(message) {
		const roleName = splitCommand(message)[1];

		if (splitCommand(message).length != 2) throw {name: "CommandError", message: "You can only join one channel per command."};
		if (!(fetchServer(message).joinableRoles.includes(roleName))) throw {name: "OtherError", message: "That channel either doesn't exist or is not joinable by users."};

		message.member.addRole(message.guild.roles.find("name", roleName));
	}

	function leaveChannel(message) {
		const roleName = splitCommand(message)[1];

		if (splitCommand(message).length != 2) throw {name: "CommandError", message: "You can only leave one channel per command."};
		if (!(fetchServer(message).joinableRoles.includes(roleName))) throw {name: "OtherError", message: "That channel either doesn't exist or cannot be left by users."};
		if (!(message.member.roles.exists("name", roleName))) throw {name: "OtherError", message: "You don't appear to be in that channel."};

		message.member.removeRole(message.member.roles.find("name", roleName));
	}

	function hideChannel(message) {
		let channelName = splitCommand(message)[1];
		if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;

		if (splitCommand(message).length != 2) throw {name: "CommandError", message: "Channel names are only one word, seperated by dashes."};
		if (!(message.guild.channels.exists("name", channelName))) throw {name: "OtherError", message: `Cannot find channel \`${channelName}\``};
		if (message.guild.channels.find("name", channelName) === message.guild.defaultChannel) throw {name: "OtherError", message: `\`${channelName}\` is the default channel of this server and cannot be hidden.`};
		
		message.guild.channels.find("name", channelName).overwritePermissions(message.author, {READ_MESSAGES: false});
		message.delete(5000);
	}

	function showChannel(message) {
		let channelName = splitCommand(message)[1];
		if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;

		if (splitCommand(message).length != 2) throw {name: "CommandError", message: "Channel names are only one word, seperated by dashes."};
		if (!(message.guild.channels.exists("name", channelName))) throw {name: "OtherError", message: `Cannot find channel \`${channelName}\``};
		if (!(message.guild.channels.find("name", channelName).permissionOverwrites.has(message.author.id)))  throw {name: "OtherError", message: `You're not hiding that channel`};
		
		message.guild.channels.find("name", channelName).permissionOverwrites.get(message.author.id).delete();
		message.delete(5000);
	}

	function ping(message) {
		if (splitCommand(message).length === 1) message.reply("pong")//.then((message) => message.delete(3000));
		else message.reply(`Your message was |${stripCommand(message)}`)//.then((message) => message.delete(3000));
	}

	function permissionLevelReporter(message){
		message.channel.sendMessage(`${message.member.displayName}'s permission level is ${permissionLevelChecker(message.member, message.guild.id)}`);
	}

	function sendChannelRules(message){
		if (!fetchChannel(message).rules || fetchChannel(message).rules === {}) throw {name: "OtherError", message: `Channel rules have not been defined for ${message.channel.name}`}
		
		const rulesEmbed = new Discord.RichEmbed();
		rulesEmbed.setAuthor(`#${message.channel.name} Rules`, "http://i.imgur.com/sIcMXQ2.png");
		rulesEmbed.setDescription(fetchServer(message).rules.disclaimer);
		rulesEmbed.setTitle("Please Note:");
		for (var section in fetchChannel(message).rules.sections){
			rulesEmbed.addField(fetchChannel(message).rules.sections[section].name, fetchChannel(message).rules.sections[section].content);
		}
		rulesEmbed.setFooter(`From the ${message.guild.name} server`);
		rulesEmbed.setColor(51455);

		message.author.sendMessage('Please enable embeds to view the channel rules.', {embed: rulesEmbed});
	
		message.delete(2000);
	}

	function sendGlobalRules(message){
		if (!fetchServer(message).rules || fetchServer(message).rules === {}) throw {name: "OtherError", message: `Server rules have not been defined for ${message.guild.name}`}
		
		const rulesEmbed = new Discord.RichEmbed();
		rulesEmbed.setAuthor(`${message.guild.name} Rules`, "http://i.imgur.com/sIcMXQ2.png");
		rulesEmbed.setDescription(fetchServer(message).rules.disclaimer);
		rulesEmbed.setTitle("Please Note:");
		for (var section in fetchServer(message).rules.sections){
			rulesEmbed.addField(fetchServer(message).rules.sections[section].name, fetchServer(message).rules.sections[section].content);
		}
		rulesEmbed.setColor(25725);

		message.author.sendMessage('Please enable embeds to view the server rules.', {embed: rulesEmbed});

		message.delete(2000);
	}

module.exports = generalCommands;