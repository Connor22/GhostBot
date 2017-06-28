class Guild{
	constructor(options){
		// variables
		if (options.static){
			this.static = options.static;
			this.channels = {};
			this.users = {};
			for (let userID in options.users){
				addUser(userID, options.users[userID]);
			}

			for (let channelID in options.channels){
				addChannel(channelID, options.channels[channelID]);
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
				}
			}

			this.channels = {};
			this.users = {};
		}
	}

	// functions
		update(){
			for (let channel in this.channels){
				this.channels[channel].update();
			}
		};

		ban(userID){
			this.users[userID].static.isBanned = true;
		};

		define(){};

		addUser(userID, options){
			this.users[userID] = new User(userID, options);
		};

		addChannel(channelID, options){
			this.channels[channelID] = new Channel(channelID, options);
		}

		getUser(userID){
			return this.users[userID];
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
					addVoting: false,
				},
				info : {
					name: options.channelName,
					serverID: options.serverID,
					id: options.channelID,
				},
				messageTracker : {
					type: "message",
					limit: 5,
					period: 20000,
					active: false,
					users: {},
				},
				imageTracker : {
					type: "image",
					limit: 5,
					period: 20000,
					active: false,
					users: {},
					trackLinks: false,
				},
				rules : {}
			}
		}
	}
		
		// Toggles
			toggleTracker(tracker){
				const trackr = fetchTracker(tracker, this);
				if (trackr.active){
					trackr.active = false;
				} else {
					trackr.active = true;
				}
			};

			toggleLinkTracking(){
				const trackr = fetchTracker("image");
				if (trackr.trackLinks){
					trackr.trackLinks = false;
				} else {
					trackr.trackLinks = true;
				}
			};	

			toggleVoting(){
				this.static.addVoting = true;
			};

		// Change
			changeTrackerPeriod(tracker, period){
				fetchTracker(tracker, this).period = period;
			};

			changeTrackerLimit(tracker, limit){
				fetchTracker(tracker, this).limit = limit;
			};

		// Getters
			getLimitMessage(tracker){
				return (capitalizeFirstLetter(fetchTracker(tracker, this).type) + " limit is currently " + fetchTracker(tracker, this).limit + " " + fetchTracker(tracker, this).type +"s.");
			};

			getPeriodMessage(tracker){
				return ("Time period in which" + fetchTracker(tracker, this).type + "s are tracked is currently " + makeReadable(fetchTracker(tracker, this).period));
			};

			getWarnMessage(tracker, userID){
				return "You've hit the " + fetchTracker(tracker, this).limit + " " + tracker + " limit in `#" + 
					this.static.info.name + "`. Please wait " + 
					makeReadable(this.getTimeRemaining(fetchTracker(tracker, this), userID)) + " before posting again";
			};

			getTimeRemaining(tracker, userID){
				return tracker.period - (Date.now() - tracker.users[userID].timeStamp);
			};

			getUser(tracker, userID){
				if (!fetchTracker(tracker, this).users[userID]) return false;
				
				return fetchTracker(tracker, this).users[userID];
			}

		//Misc
			update(){
				const trackrDict = {
					image: fetchTracker("image", this), 
					message: fetchTracker("message", this)
				};

				for (let trackrName in trackrDict){
					let trackr = trackrArray[trackrName];
					for (let user in trackr.users){
						if (trackr.users[user].getTimeRemaining(this.period) < 0){
							delete this.users[user];
						}
					}
				}		
			}

			define(){};

			addSent(userID, tracker){
				const trackr = fetchTracker(tracker, this);
				const tUser = trackr.users[userID];
				const chanID = this.id;

				if (tUser){
					tUser.sent += 1;
				} else {
					trackr.users[userID] = {
						channelID: chanID,
						sent: 1,
						timeStamp: Date.now();
					}
				}
			}

			resetTracker(userID, tracker){
				delete fetchTracker(tracker, this).users[userID];
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
				},
				isBanned: false;
			}
		}
	}
}

// Helper functions
	fetchTracker(tracker, object){
		switch (tracker){
			case "image":
				return object.static.imageTracker;
				break;
			case "message":
				return object.static.messageTracker;
				break;
		}
	}

global.Guild = Guild;
global.Channel = Channel;
global.User = User;