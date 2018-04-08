const mongoose = require('mongoose');
// Server
	// Base Server Module Schema
		const defaultSchema = mongoose.Schema({
			enabled : {type: Boolean, default: false},
			name : {
				type: String,
				default: "default"
			}
		});

		defaultSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			}
		}

		//const Module = mongoose.model('Module', moduleSSchema);

	// Vote Server Module
		const votingSchema = mongoose.Schema({
			enabled : {type: Boolean, default: false},
			voteTracker : {
				type: {type: String, default: "vote"},
				container: {type: String, default: "votes"},
				period: {type: Number, default: 86400000},
				number: {type: Number, default: 0},
				votes: {type: mongoose.Schema.Types.Mixed, default: {}},
				completedVotes: {type: mongoose.Schema.Types.Mixed, default: {}},
				deletedVotes: {type: mongoose.Schema.Types.Mixed, default: {}},
				tokenPeriod: {type: Number, default: 172800000},
				tokenIncrement: {type: Number, default: 1},
				tokenCap: {type: Number, default: 3}
			},
			voteChannels: {
				input: {type: String, default: ""},
				output: {type: String, default: ""}
			},
			name : {
				type: String,
				default: "voting"
			}
		}, {minimize: false});

		votingSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			},
			addVote: function(content, messageID, creatorID, creatorName, channelID, voteCount, emojis, period){
				this.voteTracker.votes[messageID] = {
					message: content,
					timeStamp: Date.now(),
					voteMessageID: messageID,
					creatorID: creatorID,
					channelID: channelID,
					number: voteCount,
					creatorName: creatorName
				}

				if (emojis){
					this.voteTracker.votes[messageID].emojis = emojis;
				} else { 
					this.voteTracker.votes[messageID].emojis = [
						GhostBot.guilds.get(this.static.info.id).emojis.find("name", "Yes"),
						GhostBot.guilds.get(this.static.info.id).emojis.find("name", "No")
					];
				}

				if (period) this.voteTracker.votes[messageID].period = period;
			},

			addCompletedVote: function(voteObject){
				if (!voteObject.number) this.voteTracker.completedVotes[voteObject.creator] = voteObject;
				else if (voteObject.number === 0) this.voteTracker.completedVotes[voteObject.creator] = voteObject;
				else this.voteTracker.completedVotes[voteObject.number] = voteObject;
			},

			addDeletedVote: function(voteObject){
				if (!voteObject.number) this.voteTracker.deletedVotes[voteObject.creator] = voteObject;
				else if (voteObject.number === 0) this.voteTracker.deletedVotes[voteObject.creator] = voteObject;
				else this.voteTracker.deletedVotes[voteObject.number] = voteObject;
			},

			endVote: function(vote){			
				if (!GhostBot.channels.get(vote.channelID)) {
					console.log("Can't find channel of vote");
					return;
				}

				const voteChannel = GhostBot.channels.get(this.voteChannels.output);
				GhostBot.channels.get(vote.channelID).fetchMessages().then(collection => {
					const voteMessage = collection.get(vote.messageID);

					if (!voteChannel) {
						console.error("Couldn't find channel to post in");
						return;
					}

					if (!voteMessage){
						console.error("Couldn't find Message to parse");
						this.addDeletedVote(vote);
						delete this.voteTracker.votes[vote.messageID];
						return;
					}
					
					voteMessage.reactions.forEach(cacheUsers);
					setTimeout(function() {
						const embed = createResultsEmbed(vote, voteChannel, voteMessage, this);
						voteChannel.send({"embed": embed});
						this.addCompletedVote(vote);
						voteMessage.delete(5000);
						delete this.voteTracker.votes[vote.messageID];
					}, 500 * voteMessage.reactions.size);
					
				})
				.catch(console.error);			
			},

			getVoteNumber: function(){
				return this.voteTracker.number++;
			},
		}

		//const VoteModule = Module.discriminator('VoteModule', voteSchema);

	// Levelling Server Module
		const levellingSchema = new mongoose.Schema({
			enabled : {type: Boolean, default: false},
			trackedChannels : [String],
			name : {
				type: String,
				default: "levelling"
			}
		});

		levellingSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			},
			enableXP : function(message){
				if (!this.trackedChannels) this.trackedChannels = [];
				this.trackedChannels.push(message.channel.id);
			}
		}

		//const LevellingModule = Module.discriminator('LevellingModule', levellingSchema);

	// Administration Server Module
		const administrationSchema = new mongoose.Schema({
			enabled : {type: Boolean, default: false},
			roles : {
				admin : {name: {type: String, default: ""}, id: {type: String, default: ""}},
				mod : {name: {type: String, default: ""}, id: {type: String, default: ""}},
				jmod : {name: {type: String, default: ""}, id: {type: String, default: ""}},
				softban : {type: String, default: ""}
			},
			logChannel : {type: String, default: ""},
			name : {
				type: String,
				default: "administration"
			}
		});

		administrationSchema.methods = {
		enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			},};

		//const AdministrationModule = Module.discriminator('AdministrationModule', administrationSchema);

	// Slowmode Server Module
		const slowmodeSchema = new mongoose.Schema({
			enabled : {type: Boolean, default: false},
			name : {
				type: String,
				default: "slowmode"
			}
		});

		slowmodeSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			},
		}

		//const SlowmodeModule = Module.discriminator('SlowmodeModule', slowmodeSchema);

	// Rules Server Module
		const rulesSchema = new mongoose.Schema({
			enabled : {type: Boolean, default: false},
			disclaimer : {type: String, default: ""},
			sections : [mongoose.Schema.Types.Mixed],
			name : {
				type: String,
				default: "rules"
			}
		});

		rulesSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			},
		}

		//const RuleModule = Module.discriminator('RuleModule', rulesSchema); 

	// Usercustom Server Module
		const usercustomSchema = new mongoose.Schema({
			enabled : {type: Boolean, default: false},
			joinables : {
				channels : { type: mongoose.Schema.Types.Mixed, default: {} },
				roles : { type: mongoose.Schema.Types.Mixed, default: {} }
			},
			name : {
				type: String,
				default: "levelling"
			}
		});

		usercustomSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			},
		}

		//const UsercustomModule = Module.discriminator('UsercustomModule', usercustomSchema);

	// Server
		const serverSchema = new mongoose.Schema({
			_id : {type: String, required: [true, "ID must be set!"]},
			info : {
				id : {type: String, required: [true, "ID must be set!"]},
				name : {type: String}, 
			},
			config : {
				prefix : {type: String, default: "="}
			},
			modules: {
				levelling: levellingSchema,
				slowmode: slowmodeSchema,
				voting: votingSchema,
				administration: administrationSchema,
				rules: rulesSchema,
				usercustom: usercustomSchema,
				default: defaultSchema,
			},
			users: [{ type: String, ref: 'Users' }],
			channels: [{ type: String, ref: 'Channels' }],
		}, {minimize: false});

		serverSchema.methods = {
			// database shortcuts
				getModule: function(name){
					const modulePosition = `modules.${name}`;
					//return this.model('Guild').find({_id: this._id}, {[modulePosition]: 1});
					console.log(this.model('Guild').findOne({_id: this._id}, {[modulePosition]: 1}));
				},

			// subdict functions
				addUser: function(userID, options){
					this.users[userID] = new User(options);
				},

				addChannel: function(channelID, options){
					this.channels[channelID] = new Channel(options);
				},

				getUser: function(userID){
					let user = this.users[userID];

					if (!user){
						this.addUser(userID, {serverID: this.static.info.id, "userID": userID, timeStamp: Date.now()});
						user = this.users[userID];
					}

					return user;
				},

			// administration module
				ban : function(userID){
					this.users[userID].static.modules.administration.isBanned = true;
				},

			// commands functions
				checkCommand: function(command, message){
					for (let module in this.static.modules){
						if (command in loadedModules[module]){
							if (!this.static.modules[module].enabled) return {name: "CommandError", message: "That module is disabled"};
							
							if (!this.checkPerms(command, message, this.static.modules[module])) return {name: "CommandError", message: "You are not permitted to use that command"};
							
							return loadedModules[module][command];
						}
					}

					return {name: "CommandNotFoundError"};
				},

				checkPerms: function(command, message, module){
					if (module.blacklist){
						if (module.blacklist.module && this.checkList(module.blacklist.module, message)) return false;
						if (module.blacklist[command] && this.checkList(module.blacklist[command], message)) return false;
					}
					if (module.whitelist){
						if (module.whitelist[command] && this.checkList(module.whitelist[command], message)) return true;
						if (module.whitelist.module){
							if (this.checkList(module.whitelist.module, message)) return true;
							return false;
						}
					}
					return true;
				},

				resetPerms: function(module, command){
					if (!command) command = "module";
					if (this.static.modules[module].whitelist && this.static.modules[module].whitelist[command]){
						delete this.static.modules[module].whitelist[command];
					}
					if (this.static.modules[module].blacklist && this.static.modules[module].blacklist[command]){
						delete this.static.modules[module].blacklist[command];
					}
				},

				setPerms: function(whitelist, type, id, module, command){
					if (!command) command = "module";

					if (whitelist && !this.static.modules[module].whitelist) this.static.modules[module].whitelist = {};
					if (!whitelist && !this.static.modules[module].blacklist) this.static.modules[module].blacklist = {};

					let list = {};

					if (whitelist) list = this.static.modules[module].whitelist;
					else list = this.static.modules[module].blacklist;

					if (!list[command]) list[command] = {};

					if (!list[command][type]) list[command][type] = [];
					list[command][type].push(id);
				},

				checkRoles: function(member, roleArray){
					for (let i in roleArray){
						if (member.roles.has(roleArray[i])) return true;
					}
				},

				checkList: function(blacklist, message){
					console.log("Checking list");
					if (blacklist.channels && blacklist.channels.includes(message.channel.id)) return true;

					if (blacklist.users && blacklist.users.includes(message.author.id)) return true;
				
					if (blacklist.roles && message.member && checkRoles(message.member, blacklist.roles)) true;
				
					return false;
				}
		}

		const Guild = mongoose.model('Guild', serverSchema);

// Channel
	// Channel
		const channelSchema = new mongoose.Schema({
			_id : {type: String, required: [true, "id must be set!"]},
			info : {
				id : {type: String, required: [true, "id must be set!"]},
				parent: {type: String, required: [true, "parent must be set!"]}, 
			},
			config : {
				addPostVoting : {type: Boolean, default: false}
			},
			modules: {				
			}
		}, {minimize: false});

		channelSchema.methods = {
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
			},	

			changeTrackerPeriod(trackerType, period){
				fetchTracker(trackerType, this).period = period;
			},

			changeTrackerLimit(trackerType, limit){
				fetchTracker(trackerType, this).limit = limit;
			},

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
			},

			resetTracker(userID, trackerType){
				delete fetchTracker(trackerType, this).users[userID];
			},

			getTracker(trackerType){
				return fetchTracker(trackerType, this);
			},

			getLimitMessage(trackerType){
				const tracker = fetchTracker(trackerType, this);
				return (capitalizeFirstLetter(tracker.type) + " limit is currently " + tracker.limit + " " + tracker.type +"s.");
			},

			getPeriodMessage(trackerType){
				const tracker = fetchTracker(trackerType, this);
				return ("Time period in which " + tracker.type + "s are tracked is currently " + makeReadable(tracker.period));
			},

			getWarnMessage(trackerType, userID){
				const tracker = fetchTracker(trackerType, this);
				return "You've hit the " + tracker.limit + " " + trackerType + " limit in `#" + 
					this.static.info.name + "`. Please wait " + 
					makeReadable(getTimeRemaining(tracker, userID) + 2000) + " before posting again";
			},

					toggleTracker(trackerType){
				fetchTracker(trackerType, this).active = !fetchTracker(trackerType, this).active;
			},

			getUser(tracker, userID){
				if (!fetchTracker(tracker, this).users[userID]) return false;
				
				return fetchTracker(tracker, this).users[userID];
			},

		// voting module
			togglePostVoting(){
				this.static.config.addPostVoting = !this.static.config.addPostVoting;
			},
		}

// User
	// User
		const userSchema = new mongoose.Schema({
			_id : {type: String, required: [true, "id must be set!"]},
			info : {
				id : {type: String, required: [true, "id must be set!"]}, 
				parent: {type: String, required: [true, "parent must be set!"]}
			},
			config : {
				addPostVoting : {type: Boolean, default: false}
			},
			modules: {				
			}
		}, {minimize: false});

		userSchema.methods = {
		// levelling module
			addXP(amount){
				this.static.modules.levelling.xp += amount;
			},


		// voting module
			takeToken(){
				if (this.static.modules.voting.voteTokenTracker.tokens > 0){
					this.static.modules.voting.voteTokenTracker.tokens--;
					return true;
				} else {
					return false;
				}
			},

			getTokens(){
				return this.static.modules.voting.voteTokenTracker.tokens;
			},

			addTokens(amount){
				this.static.modules.voting.voteTokenTracker.tokens += parseInt(amount);
			},

		// default module
			update(){
				// voting module
					const tracker = serverStore[this.static.info.serverID].static.modules.voting.voteTracker;
					const tokenTracker = this.static.modules.voting.voteTokenTracker;
					if (!tokenTracker) {
						console.log(`${this.static.info.id} has no voteTokenTracker`);
						return;
					}

					if (tokenTracker.timeStamp - (Date.now() - tracker.tokenPeriod) < 0){
						tokenTracker.tokens = tracker.tokenAmount;
						tokenTracker.timeStamp = Date.now();
					}

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

module.exports = Guild;