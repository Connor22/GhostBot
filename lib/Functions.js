	var embedMatcher = /\bhttp\S*/g;

	/* Limit Functions */
		function performLimitChecks(message){
			const imageBool = selectTracker(message, "image").isActive();
			const messageBool = selectTracker(message, "message").isActive();

			if (message.content === (fetchServer(message).prefix + "limits")){
				message.delete();
				return;
			}

			if (permissionLevelChecker(message.member, message.guild.id)) /*|| message.member.roles.exists('name', 'Shining E-Peen')) */ return;
			

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
			return (permissionLevelChecker(message.member, message.guild.id)
				&& selectTracker(message, "message").isActive()
				&& message.mentions.length === 1
				&& selectTracker(message, "message").getUser(message.mentions[0].id));
		}

		/* Startup Subfunctions */
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
						tracker.users[userID] = new LimitedUser(tracker.users[userID]);
					}
					if (tracker.type === "imageTracker") return new ImageTracker(tracker);
					if (tracker.type === "messageTracker") return new MessageTracker(tracker);
				}

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

	/* General Functions */
		function permissionLevelChecker(member, serverID){
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

		function splitCommand(message){
			return message.cleanContent.substr(fetchServer(message).prefix.length).split(" ");
		}

		function stripCommand(message) {
			return message.cleanContent.substr(fetchServer(message).prefix.length + splitCommand(message)[0].length + 1);
		}

		function log(options){
			let embd = {embed: {}};
			embd.embed.author = {}
			embd.embed.timestamp = new Date();
			embd.embed.fields = [];

			switch (options.type){
				case "mute":
					embd.embed.description  = `<@${options.perpetratorID}> muted <@${options.targetID}> from ${options.channelName}`;
					embd.embed.author.icon_url = "http://i.imgur.com/sPHnAIJ.png";
					embd.embed.author.name = "Mute";
					embd.embed.fields.push({name: "Length", value: options.length, inline: true});
					embd.embed.fields.push({name: "Reason", value: options.reason, inline: true});
					embd.embed.color = 16744448;
					break;
				case "unmute":
					if (options.perpetratorID) embd.embed.description  = `<@${options.perpetratorID}> unmuted <@${options.targetID}> from ${options.channelName}`;
					else embd.embed.description  = `Automatic Timer unmuted <@${options.targetID}> from ${options.channelName}`;
					embd.embed.author.icon_url = "http://i.imgur.com/sPHnAIJ.png";
					embd.embed.author.name = "Unmute";
					embd.embed.color = 16744448;
					break;	
				case "ban":
					embd.embed.description = `<@${options.perpetratorID}> banned <@${options.targetID}>`;
					embd.embed.author.icon_url = "http://i.imgur.com/1MvehEj.png";
					embd.embed.author.name = "Ban";
					embd.embed.fields.push({name: "Length", value: options.length, inline: true});
					embd.embed.fields.push({name: "Reason", value: options.reason, inline: true});
					embd.embed.color = 16711680;
					break;
				case "unban":
					if (options.perpetratorID) embd.embed.description  = `<@${options.perpetratorID}> unbanned <@${options.targetID}>`;
					else embd.embed.description  = `Automatic Timer unbanned <@${options.targetID}>`;
					embd.embed.author.icon_url = "http://i.imgur.com/1MvehEj.png";
					embd.embed.author.name = "Unban";
					embd.embed.color = 16711680;
					break;
			}

			message.guild.channels.get(fetchServer(message).logChannel).sendMessage("", embd);
		}

	/* Moderation Functions */
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

		function unban(guild, unbannedID, roleID, unbannerID, channel){
			guild.members.get(unbannedID).removeRole(roleID);
			if (channel) channel.sendMessage("Unbanned <@" + unbannedID + ">")//.then((message) => //message.delete(3000));

			delete fetchServer(message).bannedUsers[unbannedID];

			log({type: "unban", 
				targetID: unbannedID, 
				perpetratorID: unbannerID, 
				channelName: channel.name}
			);
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