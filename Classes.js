class Server{
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
					admin : "",
					mod : "",
					jmod : "",
					softban : ""
				},
				rules : {
					disclaimer : "",
					sections : {}
				},
				joinables : {
					channels : {},
					roles : {}
				}
			};

			this.channels = {};
			this.users = {};
		}
			
	}

	// functions
		update(){
			for (let channel in this.channels){
				channel
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
					limit: "5",
					period: "20000",
					active: false,
					users: {},
				},
				imageTracker : {
					type: "message",
					limit: "5",
					period: "20000",
					active: false,
					users: {},
					trackLinks: false,
				},
			}
		}
	}

	// functions
		update(){

		};

		toggleTracker(tracker){
			const trackr = fetchTracker(tracker, this);
			if (trackr.active){
				trackr.active = false;
			} else {
				trackr.active = true;
			}
		};

		changeTrackerPeriod(tracker, period){
			fetchTracker(tracker, this).period = period;
		};

		changeTrackerLimit(tracker, limit){
			fetchTracker(tracker, this).limit = limit;
		};

		toggleLinkTracking(){
			const trackr = fetchTracker("image");
			if (trackr.trackLinks){
				trackr.trackLinks = false;
			} else {
				trackr.trackLinks = true;
			}
		};	
		
		getTrackerMessage(){};
		getWarnMessage(tracker){
			return "You've hit the " + fetchTracker(tracker, this).limit + " " + this.getParent().type + " limit in `#" + 
				channelName + "`. Please wait " + 
				makeReadable(this.getTimeRemaining()) + " before posting again";
		};
		define(){};

		addSent(userID, tracker){
			const trackr = fetchTracker(tracker, this);
			const tUser = trackr.users[userID];
			if (tUser){
				tUser.sent += 1;
			} else {
				trackr.users[userID] = {
					channelID: this.id,
					sent: 1
				}
			}
		};

		resetTracker(userID, tracker){
			delete fetchTracker(tracker, this).users[userID];
		};

		getTimeRemaining(){};

		toggleVoting(){
			this.static.addVoting = true;
		};
}

class User{
	constructor(options){
		// variables
			this.static = {
				info : {
					serverID,
				},
				isBanned
			}
	}

	//functions
		getParent(){};
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