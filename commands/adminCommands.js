/* DICTIONARIES */
	const adminCommands = {
		"open" : function(message){
			openChannel(message);
		},
		"close" : function(message){
			closeChannel(message);
		},
		"createhidden" : function(message) {
			createHiddenChannel(message);
		},
		"limit" : function(message){
			limitOptions(message);
		},
		"period" : function(message){
			periodOptions(message);
		},
		"resetlimit" : function(message){
			resetLimit(message);
		},
		"startlimit" : function(message){
			startLimit(message);
		},
		"stoplimit" : function(message){
			stopLimit(message);
		},
		"invite" : function(message){
			inviteToChannel_prestep(message);
		},
		"define" : function(message){
			defineVariables(message);
		},
		"addrule" : function(message){
			addRule(message);
		},
		"clearrules" : function(message){
			clearRules(message);
		},
		"givetokens" : function(message){
			giveTokens(message);
		},
		"togglevoting" : function(message){
			togglePostVoting(message);
		}
	};

	const definableVariables = {
		"modrole" : function(message){
			if (!message.guild.roles.exists("name", splitCommand(message)[2])) throw {name: "OtherError", message: "Role not found"};

			fetchServer(message).static.roles.mod.name = splitCommand(message)[2];
			fetchServer(message).static.roles.mod.id = message.guild.roles.find("name", splitCommand(message)[2]).id;
		},
		"logchannel" : function(message){
			fetchServer(message).static.logChannel = message.channel.id;
		},
		"adminrole" : function(message){
			if (!message.guild.roles.exists("name", splitCommand(message)[2])) throw {name: "OtherError", message: "Role not found"};

			fetchServer(message).static.roles.admin.name = splitCommand(message)[2];
			fetchServer(message).static.roles.admin.id = message.guild.roles.find("name", splitCommand(message)[2]).id;
		},
		"joinablerole" : function(message){
			if (!fetchServer(message).static.roles.joinable) fetchServer(message).static.roles.joinable = [];
			fetchServer(message).static.roles.joinable.push(splitCommand(message)[2]);
		},
		"jmodrole" : function(message){
			if (!message.guild.roles.exists("name", splitCommand(message)[2])) throw {name: "OtherError", message: "Role not found"};

			fetchServer(message).static.roles.jmod.name = splitCommand(message)[2];
			fetchServer(message).static.roles.jmod.id = message.guild.roles.find("name", splitCommand(message)[2]).id;
		},
		"bannedids" : function(message){
			fetchServer(message).static.bannedUsers.push(splitCommand(message)[2]);
		},
		"rulesdisclaimer" : function(message){
			if (!fetchServer(message).static.rules) fetchServer(message).static.rules = {};

			const strip0 = stripCommand(message);
			const disclaimer = strip0.substr(splitCommand(message)[1].length + 1);

			fetchServer(message).static.rules.disclaimer = disclaimer;
		},
		"outputvotechannel" : function(message){
			fetchServer(message).static.config.outputVoteChannel = message.channel.id;
		},
		"inputvotechannel" : function(message){
			fetchServer(message).static.config.inputVoteChannel = message.channel.id;
		},
		"voteperiod" : function(message){
			fetchServer(message).static.voteTracker.period = parseTime(splitCommand(message)[2], splitCommand(message)[3]);
		}
		// "channelrulesdisclaimer" : function(message){
		// 	if (!fetchChannel(message).static.rules) fetchChannel(message).static.rules = {};

		// 	const strip0 = stripCommand(message);
		// 	const disclaimer = strip0.substr(splitCommand(message)[1].length + 1);

		// 	fetchChannel(message).static.rules.disclaimer = disclaimer;
		// }
	}

/* FUNCTIONS */
	function createHiddenChannel(message) {
		const lettersAndDashes = /^[A-Za-z\-\_0-9]+$/; 

		if (splitCommand(message).length != 2 || splitCommand(message)[1].includes("#")) throw {name: "CommandError", message: "Channel name can only be one word. Use dashes (-) or underscores (_) instead of spaces."};
		if (splitCommand(message)[1].length > 100) throw {name: "CommandError", message: "Channel names must be 100 characters or under"};
		if (!lettersAndDashes.test(splitCommand(message)[1])) throw {name: "CommandError", message: "Channel names must only include numbers, letters, dashes, or underscores."}; 

		if (!message.guild.roles.exists("name", splitCommand(message)[1])){
			message.guild.createRole({name: splitCommand(message)[1]}).then((role) => {
				createHiddenChannel_step2(message, splitCommand(message));
			});
		} else {
			createHiddenChannel_step2(message, splitCommand(message));
		}	
	}

	function createHiddenChannel_step2(message, splitCommand_const){
		message.guild.createChannel(splitCommand_const[1]).then((channel) => {
			channel.overwritePermissions(message.guild.roles.get(message.guild.id), {"READ_MESSAGES" : false});
			channel.overwritePermissions(message.guild.roles.find("name", splitCommand_const[1]), {"READ_MESSAGES" : true});
			if (!fetchServer(message).static.hiddens) fetchServer(message).static.hiddens = [];
			fetchServer(message).static.hiddens.push(channel.name);
			fetchServer(message).static.roles.joinable.push(channel.name);
		});
	}

	function stopLimit(message){
		const tracker = selectTracker(message, splitCommand(message)[1]);

		if (!tracker.active) throw {name: "CommandError", message: "Monitoring for " + splitCommand(message)[1] +" is already disabled"};

		message.channel.sendMessage(capitalizeFirstLetter(tracker.type) + " limiting disabled on this channel.");				
		fetchChannel(message).toggleTracker(tracker.type);
	}

	function startLimit(message){
		const server = fetchServer(message);
		const channelType = splitCommand(message)[1];

		const tracker = selectTracker(message, splitCommand(message)[1]);

		if (tracker.active) throw {name: "CommandError", message: "Monitoring for " + channelType +" is already enabled"};

		fetchChannel(message).toggleTracker(tracker.type);

		message.channel.sendMessage(capitalizeFirstLetter(tracker.type) + " limiting enabled on this channel.");
	}

	function resetLimit(message){
		const tracker = selectTracker(message, splitCommand(message)[1]);

		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can have their limit reset at a time."};
		//if (!tracker.getUser(message.mentions.users.array()[0].id)) throw {name: "OtherError", message: "User has not yet been limited."};

		fetchChannel(message).resetTracker(message.mentions.users.array()[0].id, tracker.type);
	}

	function openChannel(message){
		message.channel.overwritePermissions(message.guild.roles.find("name", "@everyone"), {"SEND_MESSAGES": true});
		message.channel.sendMessage("Opened channel");
		console.log(message.author.name + " opened " + message.channel.name);

	}

	function closeChannel(message){
		message.channel.overwritePermissions(message.guild.roles.find("name", "@everyone"), {"SEND_MESSAGES": false});
		message.channel.sendMessage("Closed channel");
		console.log(message.author.name + " closed " + message.channel.name);
	}

	function limitOptions(message){
		const tracker = selectTracker(message, splitCommand(message)[1]);
		const channel = fetchChannel(message);

		//Was the type of channel valid && are there a valid number of arguments
		if (!tracker && splitCommand(message).length > 3) throw {name: "CommandError", message: "Wrong number of inputs. \
			\n Format must be `limit <image|message> [#]`"};

		//If there is a new limit defined
		if (splitCommand(message).length === 3) {
		  if (isNaN(splitCommand(message)[2])) throw {name: "CommandError", message: "Second argument must be a valid number"};
		  channel.changeTrackerLimit(tracker.type, parseInt(splitCommand(message)[2]));
		}

		message.channel.sendMessage(channel.getLimitMessage(tracker.type));
	}

	function periodOptions(message){
		const tracker = selectTracker(message, splitCommand(message)[1]);
		const channel = fetchChannel(message);

		//Was the type of channel valid && are there a valid number of arguments
		if (!tracker && splitCommand(message).length == 3 || splitCommand(message).length > 4) {
			throw {name: "CommandError", message: "Wrong number of inputs. \
			\n Format must be `period <image|message> [<#> <seconds|minutes|hours]`"};
		}
		//If there is a new limit defined
		if (splitCommand(message).length === 4) {
		  if (isNaN(splitCommand(message)[2])) throw {name: "CommandError", message: "Second argument must be a valid number"};
		  channel.changeTrackerPeriod(tracker.type, parseTime(splitCommand(message)[2], splitCommand(message)[3]));
		}

		message.channel.sendMessage(channel.getPeriodMessage(tracker.type));
	}

	/*
	function inviteToChannel_prestep(message) {
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can be invited per command"};
		
		if (!fetchChannel(message).invite){
			message.channel.createInvite()
			  .then((channelInvite) => {
			  	fetchChannel(message).invite = channelInvite.url;
			  	inviteToChannel(message);
			  });  
		} else {
			inviteToChannel(message);
		}
	}

	function inviteToChannel(message){
		const invitedUser = message.mentions.users.array()[0];

		message.channel.overwritePermissions(invitedUser, {"READ_MESSAGES": true});
		message.channel.sendMessage(`Invited ${invitedUser.username}`);
		invitedUser.sendMessage(`You've been invited to join #${message.channel.name} on ${message.guild.name}\n\n${fetchChannel(message).invite}`);
	}
	*/

	function defineVariables(message){
		//if (splitCommand(message).length != 3) throw {name: "CommandError", message: "This command only takes 2 parameters"};

		if (!(splitCommand(message)[1].toLowerCase() in definableVariables)) throw {name: "OtherError", message: "That variable isn't definable"};

		definableVariables[splitCommand(message)[1].toLowerCase()](message);

		message.delete(3000);
	}

	function addRule(message){
		if (!(splitCommand(message)[1] === "server" || splitCommand(message)[1] === "channel")) throw {name: "CommandError", message: "Is this a server rule or a channel rule?"};

		const section = {};

		message.channel.sendMessage("What is the name of the section?");

		const authorFilter = (response) => {
 			return response.author === message.author;
 		}

 		message.channel.awaitMessages(authorFilter, {
		    max: 1,
		    time: 600000,
		    errors: ['time'],
		  })
		  .then((collected) => {
		    section.name = collected.first().cleanContent;
		    step2_addRule(message, section);
		  })
		  .catch(console.log);
	}

	function step2_addRule(message, section){
		message.channel.sendMessage("What is the content of the section?");

		const authorFilter = (response) => {
 			return response.author === message.author;
 		}

 		message.channel.awaitMessages(authorFilter, {
		    max: 1,
		    time: 600000,
		    errors: ['time'],
		  })
		  .then((collected) => {
		    section.content = collected.first().cleanContent;
		    if (splitCommand(message)[1] === "server"){
		    	newRuleSection(fetchServer(message).static, section);
		    } else {
		    	newRuleSection(fetchChannel(message).static, section);
		    }

		    message.delete(3000);
		  })
		  .catch(console.log);
	}

	function clearRules(message){
		if (!(splitCommand(message)[1] === "server" || splitCommand(message)[1] === "channel")) throw {name: "CommandError", message: "Clear the server rules or the channel rules?"};
		if (splitCommand(message)[1] === "server"){
			fetchServer(message).static.rules.sections = [];
		} else {
			fetchChannel(message).static.rules.sections = [];
		}

		message.delete(3000);
	}

	function giveTokens(message){
		if (message.mentions.users.array().length != 1) throw {name: "CommandError", message: "Only one user can have tokens added to their account."};
		if (isNaN(splitCommand(message)[1])) throw {name: "CommandError", message: "First argument must be a valid number"};
		console.log(splitCommand(message)[1]);
		fetchServer(message).getUser(message.mentions.users.first().id).addTokens(splitCommand(message)[1]);
	}

	function togglePostVoting(message){
		fetchChannel(message).togglePostVoting();
	}

/* HELPER FUNCTIONS */
	function newRuleSection(object, section){
		if (!object.rules) object.rules = {};
		if (!object.rules.sections) object.rules.sections = [];
		object.rules.sections.push(section);
	}

module.exports = adminCommands;