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
					logChannel : "",
					voteInputChannel : "",
					voteOutputChannel : ""
				},
				roles : {
					admin : {name: "", id: ""},
					mod : {name: "", id: ""},
					jmod : {name: "", id: ""},
					softban : ""
				},
				rules : {
					disclaimer : "",
					sections : []
				},
				joinables : {
					channels : {},
					roles : {}
				},
				voteTracker : {
					type: "vote",
					container: "votes",
					period: parseTime(24, "hours"),
					votes: {},
					tokenPeriod: parseTime(168, "hours")
				}
			}

			this.channels = {};
			this.users = {};
		}
	}

	// functions
		update(){
			for (let channelID in this.channels){
				this.channels[channelID].update();
			}

			for (let vote in this.static.voteTracker.votes){
				if (getTimeRemaining(this.static.voteTracker, vote) < 0){
					this.endVote(this.static.voteTracker.votes[vote]);
					delete this.static.voteTracker.votes[vote];
				}
			}

			for (let userID in this.users){
				this.users[userID].update();
			}
		};

		ban(userID){
			this.users[userID].static.isBanned = true;
		};

		addUser(userID, options){
			this.users[userID] = new User(options);
		};

		addChannel(channelID, options){
			this.channels[channelID] = new Channel(options);
		}

		addVote(message, messageID, creatorID, channelID, emojis, period){
			this.static.voteTracker.votes[messageID] = {
				message: message,
				timeStamp: Date.now(),
				messageID: messageID,
				creator: creatorID,
				channelID: channelID
			}
			if (emojis){
				this.static.voteTracker.votes[messageID].emojis = emojis;
			} else { 
				this.static.voteTracker.votes[messageID].emojis = [
					GhostBot.guilds.get(this.static.info.id).emojis.find("name", "Yes"),
					GhostBot.guilds.get(this.static.info.id).emojis.find("name", "No")
				];
			}

			if (period) this.static.voteTracker.votes[messageID].period = period;
		}

		endVote(vote){
			console.log("Ending vote");
			if (!GhostBot.channels.get(vote.channelID)) return;

			const voteChannel = GhostBot.channels.get(this.static.config.outputVoteChannel);
			GhostBot.channels.get(vote.channelID).fetchMessages().then(collection => {
				const voteMessage = collection.get(vote.messageID);

				if (!voteChannel) console.error("Couldn't find channel to post in");
				if (!voteMessage) console.error("Couldn't find Message to parse");
				
				if (!voteMessage) return;
				
				voteMessage.reactions.forEach(cacheUsers);
				setTimeout(function() {
					const embed = createResultsEmbed(vote, voteChannel, voteMessage);
					voteChannel.send({"embed": embed}).catch(console.error);
					voteMessage.delete(5000);
				}, 500 * voteMessage.reactions.size);
				
			})
			.catch(console.error);			
		}

		getUser(userID){
			let user = this.users[userID];

			if (!user){
				this.addUser(userID, {serverID: this.static.info.id, "userID": userID, timeStamp: Date.now()});
				user = this.users[userID];
			}

			return user;
		};
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
		
	// Toggles
		toggleTracker(trackerType){
			fetchTracker(trackerType, this).active = !fetchTracker(trackerType, this).active;
		};

		toggleLinkTracking(){
			fetchTracker("image").trackLinks = !fetchTracker("image").trackLinks;
		};	

		togglePostVoting(){
			this.static.addPostVoting = !this.static.addPostVoting;
		};

	// Change
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

			if (user.sent = tracker.limit) return true;
		};

		resetTracker(userID, trackerType){
			delete fetchTracker(trackerType, this).users[userID];
		};

	// Getters
		getLimitMessage(trackerType){
			const tracker = fetchTracker(trackerType, this);
			return (capitalizeFirstLetter(tracker.type) + " limit is currently " + tracker.limit + " " + tracker.type +"s.");
		};

		getPeriodMessage(trackerType){
			const tracker = fetchTracker(trackerType, this);
			return ("Time period in which" + tracker.type + "s are tracked is currently " + makeReadable(tracker.period));
		};

		getWarnMessage(trackerType, userID){
			const tracker = fetchTracker(trackerType, this);
			return "You've hit the " + tracker.limit + " " + trackerType + " limit in `#" + 
				this.static.info.name + "`. Please wait " + 
				makeReadable(getTimeRemaining(tracker, userID) + 2000) + " before posting again";
		};

		getUser(tracker, userID){
			if (!fetchTracker(tracker, this).users[userID]) return false;
			
			return fetchTracker(tracker, this).users[userID];
		}

	//Misc
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
				isBanned: false,
				voteTokenTracker: {
					tokens: 3,
					timeStamp: options.timeStamp
				}
			}
		}
	}

	takeToken(){
		if (this.static.voteTokenTracker.tokens > 0){
			this.static.voteTokenTracker.tokens--;
			return true;
		} else {
			return false;
		}
	}

	getTokens(){
		return this.static.voteTokenTracker.tokens;
	}

	update(){
		if (this.static.info.serverID){
			const tracker = serverStore[this.static.info.serverID].static.voteTracker;
			if (this.static.voteTokenTracker.period - (Date.now() - tracker.tokenPeriod) < 0){
				this.static.voteTokenTracker.tokens += 3;
				this.static.voteTokenTracker.period = Date.now();
			}
		}
	}

	addTokens(amount){
		this.static.voteTokenTracker.tokens += parseInt(amount);
	}
}

// Helper functions
	function fetchTracker(tracker, object){
		switch (tracker){
			case "image":
				return object.static.imageTracker;
				break;
			case "message":
				return object.static.messageTracker;
				break;
		}
	}

	function createResultsEmbed(vote, voteChannel, voteMessage){
		const embed = new Discord.RichEmbed();
		const reactions = voteMessage.reactions;
		
		const reactionUserTables = {};
		const reactionEmojiTables = {};
	
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
					embed.setAuthor("Vote Passed", "http://i.imgur.com/3sv0cFd.png");
					embed.setColor(16744448);
					break;
				case "No":
					embed.setAuthor("Vote Denied", "http://i.imgur.com/sPHnAIJ.png");
					embed.setColor(16711680);
					break;
				default:
					console.log(voteArray[0][2].name);
					embed.setAuthor("Vote Completed", "http://i.imgur.com/1MvehEj.png");
					break;
			}
		} else if (voteArray[0][2].name === "Yes" || voteArray[0][2].name === "No") {
			embed.setAuthor("Vote Denied", "http://i.imgur.com/sPHnAIJ.png");
			embed.setColor(16711680);
		} else {
			console.log(voteArray);
			embed.setAuthor("Vote Completed", "http://i.imgur.com/1MvehEj.png");
		}

		embed.setTitle(vote.message);
		embed.setDescription("Results:");
		embed.setFooter(`Total votes: ${voteTotal}`)
		embed.setTimestamp();

		for (let i in voteArray){
			const vote = voteArray[i];
			embed.addField(vote[2], `${vote[1]} - ${(vote[0] * 100).toFixed(2)}%`, true);
		}
		if (multiVoters.length > 1){
			let shameString = "";
			for (let i in multiVoters){
				if (!(multiVoters[i] === GhostBot.user.id)){
					if (shameString != "") shameString += ", ";
					shameString += multiVoters[i];
				}
			}
			embed.addField("Shamed Users", shameString);
		}

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