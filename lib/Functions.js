	var embedMatcher = /\bhttp\S*/g;

	function performLimitChecks(message){
		const imageBool = selectTracker(message, "image").isActive();
		const messageBool = selectTracker(message, "message").isActive();

		if (message.content === (fetchServer(message).prefix + "limits")){
			message.delete();
			return;
		}
		//if (permissionLevelChecker(message.guild.fetchMember(message.author), message.guild.id)) /*|| message.guild.fetchMember(message.author).roles.exists('name', 'Shining E-Peen')) */ return;
		

		if (message.attachments.size === 0){
			if (imageBool && URLCheck(message)) userSentMessage(message, selectTracker(message, "image"), message.cleanContent.match(embedMatcher).length);
			else if (messageBool) userSentMessage(message, selectTracker(message, "message"));
		} else {
			if (imageBool) userSentMessage(message, selectTracker(message, "image"));
		}
	}

	/* performLimitChecks SUBFUNCTIONS */
		function URLCheck(message){
			return (selectTracker(message, "image").isActive() 
				&& selectTracker(message, "image").embedsEnabled 
				&& message.cleanContent.match(embedMatcher));
		}

		function userSentMessage(message, tracker, amount){
			var user = tracker.getUser(message.author.id);

			if (!user) user = tracker.addUser(message.author.id);

			if (user.addSent(amount)){
				//muteUser(message.author.id, message.channel.id, message.guild.id, tracker.type);
				message.delete();
				message.author.sendMessage(user.warnMessage(message.channel.name));
			}
		}

	function resetCheck(message){
		return (permissionLevelChecker(message.guild.member, message.guild.id)
			&& selectTracker(message, "message").isActive()
			&& message.mentions.length === 1
			&& selectTracker(message, "message").getUser(message.mentions[0].id));
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
		if (!member || !serverStore[serverID]) return false;

		if (!member.roles){
			console.log("Roles not found");
			return false;
		}
		return member.roles.exists('name', serverStore[serverID].roles[level].name) ||
		 member.roles.has(serverStore[serverID].roles[level].id);
	}

	function fetchServer(message){
		return serverStore[message.guild.id];
	}

	function fetchChannel(message){
		if (!serverStore[message.guild.id].channels[message.channel.id]) {
			serverStore[message.guild.id].channels[message.channel.id] = {};
			serverStore[message.guild.id].channels[message.channel.id].rules = {embed: {}};
		}
		return serverStore[message.guild.id].channels[message.channel.id];
	}

	function convertTrackers(serverStore) {
		for (let tserver in serverStore){
			for (let tchannel in serverStore[tserver].channels){
				const channel = serverStore[tserver].channels[tchannel];
				if (channel.imageTracker) channel.imageTracker = createTracker(channel.imageTracker);
				if (channel.messageTracker) channel.messageTracker = createTracker(channel.messageTracker);
			}
		}
	}

		function createTracker(tracker){
			for (let userID in tracker.users){
				tracker.users[userID] = new User(tracker.users[userID]);
			}
			if (tracker.type === "imageTracker") return new ImageTracker(tracker);
			if (tracker.type === "messageTracker") return new MessageTracker(tracker);
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

		if (!channel.imageTracker) channel.imageTracker = new ImageTracker({serverID: message.guild.id, channelID: message.channel.id});
		if (!channel.messageTracker) channel.messageTracker = new MessageTracker({serverID: message.guild.id, channelID: message.channel.id});

		switch(type){
			case "image":
			case "images":
				return channel.imageTracker;
				break;
			case "message":
			case "messages":
				return channel.messageTracker;
				break;
			default:
				throw {name: "CommandError", message: "Second argument must be either `image` or `message` depending on what type of tracking you wish to modify"};
				break;
		}
	}

	function splitCommand(message){
		return message.cleanContent.substr(fetchServer(message).prefix.length).split(" ");
	}

	function stripCommand(message) {
		return message.cleanContent.substr(fetchServer(message).prefix.length + splitCommand(message)[0].length + 1);
	}

	function log(type, message){
		let embd = {embed: {}};
		embd.embed.author = {}
		embd.embed.timestamp = new Date();

		switch (type){
			case "mute":
				embd.embed.description  = `<@${message.author.id}> muted <@${message.mentions.users.first().id}> from ${message.channel.name}`;
				embd.embed.author.icon_url = "http://i.imgur.com/sPHnAIJ.png";
				embd.embed.author.name = "Mute";
				embd.embed.color = 16744448;
				break;
			case "unmute":
				embd.embed.description  = `<@${message.author.id}> unmuted <@${message.mentions.users.first().id}> from ${message.channel.name}`;
				embd.embed.author.icon_url = "http://i.imgur.com/sPHnAIJ.png";
				embd.embed.author.name = "Unmute";
				embd.embed.color = 16744448;
				break;	
			case "ban":
				embd.embed.description = `<@${message.author.id}> banned <@${message.mentions.users.first().id}>`;
				embd.embed.author.icon_url = "http://i.imgur.com/1MvehEj.png";
				embd.embed.author.name = "Ban";
				embd.embed.color = 16711680;
				break;
			case "unban":
				embd.embed.description  = `<@${message.author.id}> unbanned <@${message.mentions.users.first().id}>`;
				embd.embed.author.icon_url = "http://i.imgur.com/1MvehEj.png";
				embd.embed.author.name = "Unban";
				embd.embed.color = 16711680;
				break;
		}

		message.guild.channels.get(fetchServer(message).logChannel).sendMessage("", embd);
	}


global.checkPermissions = checkPermissions;
global.permissionLevelChecker = permissionLevelChecker;
global.fetchServer = fetchServer;
global.fetchChannel = fetchChannel;
global.performLimitChecks = performLimitChecks;
global.resetCheck = resetCheck;
global.convertTrackers = convertTrackers;
global.muteUser = muteUser;
global.unmuteUser = unmuteUser;
global.selectTracker = selectTracker;
global.splitCommand = splitCommand;
global.stripCommand = stripCommand;
global.log = log;