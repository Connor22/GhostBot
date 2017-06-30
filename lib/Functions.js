	var embedMatcher = /\bhttp\S*/g;

	function performLimitChecks(message){
		const imageBool = selectTracker(message, "image").active;
		const messageBool = selectTracker(message, "message").active;

		if (message.content === (fetchServer(message).static.config.prefix + "limits")){
			message.delete();
			return;
		}
		//if (permissionLevelChecker(message.guild.fetchMember(message.author), message.guild.id)) /*|| message.guild.fetchMember(message.author).roles.exists('name', 'Shining E-Peen')) */ return;
		

		if (message.attachments.size === 0){
			if (imageBool && URLCheck(message)){
				for(var i = 0; i < message.cleanContent.match(embedMatcher).length; i++) {
					 userSentMessage(message, selectTracker(message, "image"));
				}
			}
			else if (messageBool) userSentMessage(message, "message");
		} else {
			if (imageBool) userSentMessage(message, "image");
		}
	}

	/* performLimitChecks SUBFUNCTIONS */
		function URLCheck(message){
			return (selectTracker(message, "image").active 
				&& selectTracker(message, "image").trackLinks 
				&& message.cleanContent.match(embedMatcher));
		}

		function userSentMessage(message, tracker){
			if (fetchChannel(message).addSent(message.author.id, tracker)){
				//muteUser(message.author.id, message.channel.id, message.guild.id, tracker.type);
				message.delete();
				message.author.sendMessage(fetchChannel(message).getWarnMessage(tracker, message.author.id));
			}
		}

	function resetCheck(message){
		return (permissionLevelChecker(message.guild.member, message.guild.id)
			&& selectTracker(message, "message").active
			&& message.mentions.length === 1);
	}


	function permissionLevelChecker(member, serverID){
		if (!member) return 0;
		if (checkPermissions(member, "admin", serverID) || member.hasPermission('ADMINISTRATOR')){
			return 1;
		} else if (checkPermissions(member, "mod", serverID)){
			return 2;
		} else  if (checkPermissions(member, "jmod", serverID)) {
			return 3;
		} else {
			return 0;
		}
	}

	function checkPermissions(member, level, serverID){
		const server = serverStore[serverID];
		if (!member || !server) return false;

		if (!member.roles){
			console.log("Roles not found");
			return false;
		}
		return member.roles.exists('name', server.static.roles[level].name) ||
		 member.roles.has(server.static.roles[level].id);
	}

	function fetchServer(message){
		return serverStore[message.guild.id];
	}

	function fetchChannel(message){
		if (!serverStore[message.guild.id].channels[message.channel.id]) {
			serverStore[message.guild.id].addChannel(message.channel.id, {
				channelName: message.channel.name,
				channelID: message.channel.id,
				serverID: message.guild.id
			});
		}
		return serverStore[message.guild.id].channels[message.channel.id];
	}

	function convertClasses(serverStore) {
		for (let tserver in serverStore){
			/*
				for (let tchannel in serverStore[tserver].channels){
					const channel = serverStore[tserver].channels[tchannel];
					serverStore[tserver].channels[tchannel] = newServer.addChannel(tchannel, channel);
				}
				for (let tusers in serverStore[tserver].users){
					const user = serverStore[tserver].users[tuser];
					serverStore[tserver].users[tuser] = newServer.addUser(tuser, user);
				}
			*/
			serverStore[tserver] = new Guild(serverStore[tserver]);
		}
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
	};

	function selectTracker(message, type){
		let channel = fetchChannel(message);

		switch(type){
			case "image":
			case "images":
				return channel.static.imageTracker;
				break;
			case "message":
			case "messages":
				return channel.static.messageTracker;
				break;
			default:
				throw {name: "CommandError", message: "Second argument must be either `image` or `message` depending on what type of tracking you wish to modify"};
				break;
		}
	}

	function splitCommand(message){
		return message.cleanContent.substr(fetchServer(message).static.config.prefix.length).split(" ");
	}

	function stripCommand(message) {
		return message.cleanContent.substr(fetchServer(message).static.config.prefix.length + splitCommand(message)[0].length + 1);
	}

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

		message.guild.channels.get(fetchServer(message).static.config.logChannel).sendMessage("", embd);
	}

	function getTimeRemaining(tracker, id, period){
		let period = tracker[tracker.container][id].period;
		if (!tracker[tracker.container][id].period) period = tracker.period;
		
		return period - (Date.now() - tracker[tracker.container][id].timeStamp);
	}


global.getTimeRemaining = getTimeRemaining;
global.checkPermissions = checkPermissions;
global.permissionLevelChecker = permissionLevelChecker;
global.fetchServer = fetchServer;
global.fetchChannel = fetchChannel;
global.performLimitChecks = performLimitChecks;
global.resetCheck = resetCheck;
global.convertClasses = convertClasses;
global.muteUser = muteUser;
global.unmuteUser = unmuteUser;
global.selectTracker = selectTracker;
global.splitCommand = splitCommand;
global.stripCommand = stripCommand;
global.log = log;