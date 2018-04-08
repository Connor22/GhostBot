class Server{
	constructor(options){
		// variables
			this.static = {
				info : {
					id,
					name
				},
				config : {
					setupUserID,
					prefix,
					logChannel,
				},
				roles : {
					admin,
					mod,
					jmod,
					softban
				},
				rules : {
					disclaimer,
					sections
				},
				joinables : {
					channels,
					roles
				}
			}
			this.channels;
			
	}

	// functions
		update(){};
		ban(){};
		define(){};

}

class Channel{
	constructor(options){
		// variables
			this.static = {
				config : {
					addVoting
				},
				info : {
					name,
					serverID,
					id
				},
				messageTracker : {
					type,
					limit,
					period,
					active
				},
				imageTracker : {
					type,
					limit,
					period,
					active,
					trackLinks
				},
			};
			
			this.users;
	}

	// functions
		addUser(userID){};
		getUser(){};
		update(){};
		toggleTracker(){};
		changeTrackerPeriod(){};
		changeTrackerLimit(){};
		toggleLinkTracking(){};	
		getTrackerMessage(){};
		getWarnMessage(){};
		define(){};
}

class User{
	constructor(options){
		// variables
			this.static = {
				info : {
					serverID,
					channelID
				},
				messageTracker : {
					timeStamp,
					sent,
					type
				},
				imageTracker : {
					timeStamp,
					sent,
					type
				},
				isBanned
			}
			

		//functions
		resetTracker(){};
		getTimeRemaining(){};
		getParent(){};
		addSent(){};
	}
}