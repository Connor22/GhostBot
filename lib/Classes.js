class Guild{
	constructor(options){
		// variables
		if (options.static){
			this.static = options.static;
			this.channels = {};
			this.users = {};
			for (let userID in options.users){
				this.addUser(userID, options.users[userID]);
			}

			for (let channelID in options.channels){
				this.addChannel(channelID, options.channels[channelID]);
			}

		} else {
			this.static = {
				info : {
					id : "",
					name : ""
				},
				config : {
					setupUserID : options.setupUserID,
					prefix : "",
				},
				modules: {
					levelling: {
						enabled: true
					},
					default: {
						enabled: true
					},
					slowmode: {
						enabled: false
					},
					voting: {
						enabled: false,
						voteTracker : {
							type: "vote",
							container: "votes",
							period: parseTime(24, "hours"),
							number: 0,
							votes: {},
							completedVotes: {},
							tokenPeriod: parseTime(48, "hours"),
							tokenAmount: 1,
							tokenCap: 3,
							tokenResetTimestamp: Date.now()
						},
						voteChannels: {
							input: "",
							output: ""
						}
					},
					administration: {
						enabled: true,
						roles : {
							admin : {name: "", id: ""},
							mod : {name: "", id: ""},
							jmod : {name: "", id: ""},
							softban : ""
						},
						logChannel : ""
					},
					rules: {
						enabled: false,
						disclaimer : "",
						sections : []
					},
					usercustom: {
						enabled: false,
						joinables : {
							channels : {},
							roles : {}
						}
					}
				}
			}

			this.channels = {};
			this.users = {};
		}
	}

	// Standard functions
		update(){
			for (let channelID in this.channels){
				this.channels[channelID].update();
			}

			for (let vote in this.static.modules.voting.voteTracker.votes){
				if (getTimeRemaining(this.static.modules.voting.voteTracker, vote) < 0){
					this.endVote(this.static.modules.voting.voteTracker.votes[vote]);
				}
			}

			//for (let userID in this.users){
				//this.users[userID].update();
			//}

			if (this.static.modules.voting.voteTracker.tokenPeriod - (Date.now() - this.static.modules.voting.voteTracker.tokenResetTimestamp) < 0){
				for (let userID in this.users){
					this.users[userID].tokenUpdate();
				}
				this.static.modules.voting.voteTracker.tokenResetTimestamp = Date.now();
			}
		};

		addUser(userID, options){
			this.users[userID] = new User(options);
		};

		addChannel(channelID, options){
			this.channels[channelID] = new Channel(options);
		};

		getUser(userID){
			let user = this.users[userID];

			if (!user){
				this.addUser(userID, {serverID: this.static.info.id, "userID": userID, timeStamp: Date.now()});
				user = this.users[userID];
			}

			return user;
		};

	// Voting functions
		addVote(message, messageID, creatorID, creatorName, channelID, voteCount, emojis, period){
			this.static.modules.voting.voteTracker.votes[messageID] = {
				message: message,
				timeStamp: Date.now(),
				messageID: messageID,
				creator: creatorID,
				channelID: channelID,
				number: voteCount,
				creatorName: creatorName
			}

			if (emojis){
				this.static.modules.voting.voteTracker.votes[messageID].emojis = emojis;
			} else { 
				this.static.modules.voting.voteTracker.votes[messageID].emojis = [
					GhostBot.guilds.get(this.static.info.id).emojis.find("name", "Yes"),
					GhostBot.guilds.get(this.static.info.id).emojis.find("name", "No")
				];
			}

			if (period) this.static.modules.voting.voteTracker.votes[messageID].period = period;
		}

		addCompletedVote(voteObject){
			if (!voteObject.number) this.static.modules.voting.voteTracker.completedVotes[voteObject.creator] = voteObject;
			else if (voteObject.number === 0) this.static.modules.voting.voteTracker.completedVotes[voteObject.creator] = voteObject;
			else this.static.modules.voting.voteTracker.completedVotes[voteObject.number] = voteObject;
		}

		endVote(vote){
			const server = this;
			
			if (!GhostBot.channels.get(vote.channelID)) {
				console.log("Can't find channel of vote");
				return;
			}

			const voteChannel = GhostBot.channels.get(this.static.modules.voting.voteChannels.output);
			GhostBot.channels.get(vote.channelID).fetchMessages().then(collection => {
				const voteMessage = collection.get(vote.messageID);

				if (!voteChannel) {
					console.error("Couldn't find channel to post in");
					return;
				}

				if (!voteMessage){
					console.error("Couldn't find Message to parse");
					server.addCompletedVote(vote);
					delete server.static.modules.voting.voteTracker.votes[vote.messageID];
					return;
				}
				
				voteMessage.reactions.forEach(cacheUsers);
				setTimeout(function() {
					const embed = createResultsEmbed(vote, voteChannel, voteMessage, server);
					voteChannel.send({"embed": embed});
					voteMessage.delete(5000);
					delete server.static.modules.voting.voteTracker.votes[vote.messageID];
				}, 500 * voteMessage.reactions.size);
				
			})
			.catch(console.error);			
		}

		getVoteNumber(){
			this.static.modules.voting.voteTracker.number += 1;
			return this.static.modules.voting.voteTracker.number;
		}

	// administration module
		ban(userID){
			this.users[userID].static.modules.administration.isBanned = true;
		};

	// levelling module
		enableXP(message){
			const module = this.static.modules.levelling;

			if (!module.trackedChannels) module.trackedChannels = [];
			module.trackedChannels.push(message.channel.id);
		}	

	// commands functions
		checkCommand(command, message){
			for (let module in this.static.modules){
				if (command in loadedModules[module]){
					if (!this.static.modules[module].enabled) return {name: "CommandError", message: "That module is disabled"};
					
					if (!this.checkPerms(command, message, this.static.modules[module])) return {name: "CommandError", message: "You are not permitted to use that command"};
					
					return loadedModules[module][command];
				}
			}

			return {name: "CommandNotFoundError"};
		}

		checkPerms(command, message, module){
			if (module.blacklist){
				if (module.blacklist.module && this.checkList(module.blacklist.module, message)) return false;
				if (module.blacklist[command] && this.checkList(module.blacklist[command], message)) return false;
			}
			if (module.whitelist){
				if (module.whitelist[command] && this.checkList(module.whitelist[command], message)) return true;
				if (module.whitelist.module){
					if (this.checkList(module.whitelist.module, message)) return true;
					console.log("check complete")
					return false;
				}
			}
			return true;
		}

		resetPerms(module, command){
			if (!command) command = "module";
			if (this.static.modules[module].whitelist && this.static.modules[module].whitelist[command]){
				delete this.static.modules[module].whitelist[command];
			}
			if (this.static.modules[module].blacklist && this.static.modules[module].blacklist[command]){
				delete this.static.modules[module].blacklist[command];
			}
		}

		setPerms(whitelist, type, id, module, command){
			if (!command) command = "module";

			if (whitelist && !this.static.modules[module].whitelist) this.static.modules[module].whitelist = {};
			if (!whitelist && !this.static.modules[module].blacklist) this.static.modules[module].blacklist = {};

			let list = {};

			if (whitelist) list = this.static.modules[module].whitelist;
			else list = this.static.modules[module].blacklist;

			if (!list[command]) list[command] = {};

			if (!list[command][type]) list[command][type] = [];
			list[command][type].push(id);
		}

		checkRoles(member, roleArray){
			for (let i in roleArray){
				if (member.roles.has(roleArray[i])) return true;
			}

			return false;
		}

		checkList(list, message){

			if (list.channels && list.channels.includes(message.channel.id)) return true;

			if (list.users && list.users.includes(message.author.id)) return true;
		
			if (list.roles && message.member && this.checkRoles(message.member, list.roles)) return true;

			return false;
		}
}

class Channel{
	constructor(options){
		// variables
		if (options.static){
			this.static = options.static;
		} else {
			this.static = {
				config : {
					addPostVoting: false,
				},
				info : {
					name: options.channelName,
					serverID: options.serverID,
					id: options.channelID,
				},
				messageTracker : {
					container: "users",
					type: "message",
					limit: 5,
					period: 20000,
					active: false,
					users: {},
				},
				imageTracker : {
					container: "users",
					type: "image",
					limit: 5,
					period: 20000,
					active: false,
					users: {},
					trackLinks: false,
				},
				rules : {}
			};
		}
	}

	// default module
		update(){
			const trackerDict = {
				image: fetchTracker("image", this), 
				message: fetchTracker("message", this)
			};

			for (let trackerName in trackerDict){
				let tracker = trackerDict[trackerName];
				for (let userID in tracker.users){
					if (getTimeRemaining(tracker, userID) < 0){
						delete tracker.users[userID];
					}
				}
			}		
		}

	// slowmode module
		toggleLinkTracking(){
			fetchTracker("image").trackLinks = !fetchTracker("image").trackLinks;
		};	

		changeTrackerPeriod(trackerType, period){
			fetchTracker(trackerType, this).period = period;
		};

		changeTrackerLimit(trackerType, limit){
			fetchTracker(trackerType, this).limit = limit;
		};

		addSent(userID, trackerType){
			const tracker = fetchTracker(trackerType, this);
			let user = tracker.users[userID];
			const chanID = this.id;

			if (user){
				user.sent += 1;
			} else {
				let time = Date.now();
				tracker.users[userID] = {
					channelID: chanID,
					sent: 1,
					timeStamp: time
				}

				user = tracker.users[userID];
			}

			if (user.sent > tracker.limit) return true;
		};

		resetTracker(userID, trackerType){
			delete fetchTracker(trackerType, this).users[userID];
		};

		getTracker(trackerType){
			return fetchTracker(trackerType, this);
		}

		getLimitMessage(trackerType){
			const tracker = fetchTracker(trackerType, this);
			return (capitalizeFirstLetter(tracker.type) + " limit is currently " + tracker.limit + " " + tracker.type +"s.");
		};

		getPeriodMessage(trackerType){
			const tracker = fetchTracker(trackerType, this);
			return ("Time period in which " + tracker.type + "s are tracked is currently " + makeReadable(tracker.period));
		};

		getWarnMessage(trackerType, userID){
			const tracker = fetchTracker(trackerType, this);
			return "You've hit the " + tracker.limit + " " + trackerType + " limit in `#" + 
				this.static.info.name + "`. Please wait " + 
				makeReadable(getTimeRemaining(tracker, userID) + 2000) + " before posting again";
		};

				toggleTracker(trackerType){
			fetchTracker(trackerType, this).active = !fetchTracker(trackerType, this).active;
		};

		getUser(tracker, userID){
			if (!fetchTracker(tracker, this).users[userID]) return false;
			
			return fetchTracker(tracker, this).users[userID];
		}

	// voting module
		togglePostVoting(){
			this.static.config.addPostVoting = !this.static.config.addPostVoting;
		};
}

class User{
	constructor(options){
		if (options.static){
			this.static = options.static;
		} else {
			this.static = {
				info : {
					serverID: options.serverID,
					id: options.userID
				},
				modules: {
					voting: {
						voteTokenTracker: {
							tokens: 1,
							timeStamp: options.timeStamp
						}
					},
					administration: {
						isBanned: false
					},
					levelling: {
						level: 0,
						xp: 0,
						lastMessageTimestamp: Date.now()
					}
				}
			}
		}
	}

	// levelling module
		addXP(amount){
			this.static.modules.levelling.xp += amount;
		}


	// voting module
		takeToken(){
			if (this.static.modules.voting.voteTokenTracker.tokens > 0){
				this.static.modules.voting.voteTokenTracker.tokens--;
				return true;
			} else {
				return false;
			}
		}

		getTokens(){
			return this.static.modules.voting.voteTokenTracker.tokens;
		}

		addTokens(amount){
			this.static.modules.voting.voteTokenTracker.tokens += parseInt(amount);
		}

	// default module
		tokenUpdate(){
			// voting module
				const tracker = serverStore[this.static.info.serverID].static.modules.voting.voteTracker;
				const tokenTracker = this.static.modules.voting.voteTokenTracker;
				if (!tokenTracker) {
					console.log(`${this.static.info.id} has no voteTokenTracker`);
					return;
				}

				if (tokenTracker.tokens < tracker.tokenCap) tokenTracker.tokens += tracker.tokenAmount;

			/* levelling module
				const levelModule = serverStore[this.static.info.serverID].static.modules.levelling;
				if (this.static.modules.levelling.xp > levelModule.xpToLevel){
					this.static.modules.levelling.level += 1;
					this.static.modules.levelling.xp -= levelModule.xpToLevel;
				}
			*/
		}
}

// Helper functions
	function fetchTracker(trackerType, object){
		switch (trackerType){
			case "image":
			case "images":
				return object.static.imageTracker;
				break;
			case "message":
			case "messages":
				return object.static.messageTracker;
				break;
		}
	}

	function createResultsEmbed(vote, voteChannel, voteMessage, server){
		const embed = new Discord.RichEmbed();
		const reactions = voteMessage.reactions;
		
		const reactionUserTables = {};
		const reactionEmojiTables = {};
	
		const voteObject = {
			creatorID: vote.creatorID,
			content: vote.message,
			options: {},
			timeStarted: vote.timeStamp,
			timeEnded: Date.now(),
		}

		const multiVoters = filterMultiVotes(reactions, reactionUserTables, reactionEmojiTables);

		voteArray = [];
		let voteTotal = 0;

		for (let id in reactionUserTables){
			voteTotal += reactionUserTables[id].length;
		}

		for (let emoji in reactionEmojiTables){
			const votePercent = reactionUserTables[emoji].length / voteTotal;
			voteArray.push([votePercent, reactionUserTables[emoji].length, reactionEmojiTables[emoji]]);
		}

		voteArray = voteArray.sort(function(a, b) { 
		    return a[0] < b[0] ? 1 : -1;
		});

		if (voteArray[0][0] >= 0.6){
			switch (voteArray[0][2].name){
				case "Yes":
					embed.setAuthor(`Vote #${vote.number} Passed`, "http://i.imgur.com/3sv0cFd.png");
					embed.setColor(2245120);
					break;
				case "No":
					embed.setAuthor(`Vote #${vote.number} Denied`, "http://i.imgur.com/sPHnAIJ.png");
					embed.setColor(16711680);
					break;
				default:
					console.log(voteArray[0][2].name);
					embed.setAuthor(`Vote #${vote.number} Completed`, "http://i.imgur.com/1MvehEj.png");
					break;
			}
		} else if (voteArray[0][2].name === "Yes" || voteArray[0][2].name === "No") {
			embed.setAuthor(`Vote #${vote.number} Denied`, "http://i.imgur.com/sPHnAIJ.png");
			embed.setColor(16711680);
		} else {
			console.log(voteArray);
			embed.setAuthor(`Vote #${vote.number} Completed`, "http://i.imgur.com/1MvehEj.png");
		}

		embed.setTitle("Vote Content:");
		embed.setDescription(vote.message);
		if (vote.creatorName) embed.setFooter(`Vote started by ${vote.creatorName} | ID: ${vote.creator}`);
		else embed.setFooter(`Vote started by ID: ${vote.creatorID}`);
		embed.setTimestamp();

		for (let i in voteArray){
			const v = voteArray[i];
			embed.addField(v[2], `${v[1]} - ${(v[0] * 100).toFixed(2)}%`, true);
			voteObject.options[v[2].id] = {
				numberVotes: v[1],
				percentageVote: (v[0] * 100).toFixed(2),
				name: v[2].name
			}
		}

		if (multiVoters.length > 1){
			let shameString = "";
			for (let i in multiVoters){
				if (!(multiVoters[i] === GhostBot.user.id)){
					if (shameString != "") shameString += ", ";
					shameString += multiVoters[i];
				}
			}
			if (shameString != "") embed.addField("Shamed Users", shameString);
		}

		voteObject.total = voteTotal;
		voteObject.embed = embed;
		voteObject.winningOption = voteArray[0][2].id;

		// if (voteObject.number === 0) server.modules.voting.voteTracker.completedVotes[voteObject.creatorID] = voteObject;
		// else server.modules.voting.voteTracker.completedVotes[voteObject.number] = voteObject;

		server.addCompletedVote(voteObject);

		return embed;
	}

	function filterMultiVotes(reactions, reactionUserTables, reactionEmojiTables){
		let allMatchingUsers = [];
		const reactionArray = reactions.array();

		for (let r in reactionArray){
			const reaction = reactionArray[r];
			reactionUserTables[reaction.emoji.id] = reaction.users.keyArray();
			reactionEmojiTables[reaction.emoji.id] = reaction.emoji;
		}

		for (let r in reactionUserTables){
			for (let r2 in reactionUserTables){			
				if (r2 != r){
					const matchingUsers = compare(reactionUserTables[r], reactionUserTables[r2]);
					allMatchingUsers = matchingUsers.concat(allMatchingUsers);
				}
			}
		}
		
		const uniqueMatchingUsers = Array.from(new Set(allMatchingUsers));
		const multivoters = [];

		for (let userI in uniqueMatchingUsers){
			const userID = uniqueMatchingUsers[userI];
			multivoters.push(userID);
			for (let r in reactionUserTables){
				const index = reactionUserTables[r].indexOf(userID);
				if (index > -1){
					reactionUserTables[r].splice(index, 1);
				}
			}
		}

		return multivoters;
	}

	function compare(arr1, arr2){
		var arr = arr1.concat(arr2);
		var sorted_arr = arr.sort();
		var results = [];
		for (var i = 0; i < arr.length - 1; i++) {
		    if (sorted_arr[i + 1] == sorted_arr[i]) {
		        results.push(sorted_arr[i]);
		    }
		}

		return results;
	}

	function cacheUsers(value, key, map){
		value.fetchUsers().then(collection => {});
	}

global.Guild = Guild;
global.Channel = Channel;
global.User = User;