class LimitTracker{
	constructor(options){
		this.serverID = options.serverID;
		this.channelID = options.channelID;
		if (!options.limit){this.limit = 5;} else {this.limit = options.limit;}
		if (!options.period){this.period = 20000;} else {this.period = options.period;}
		if (!options.active){this.active = false;} else {this.active = options.active;}
		if (!options.users){this.users = {};} else {this.users = options.users;}
	}

	addUser(userID){
		this.users[userID] = new LimitedUser({serverID: this.serverID, channelID: this.channelID, type: this.type}); 
		return this.users[userID];
	}

	update(){
		for (var user in this.users){
			if (this.users[user].getTimeRemaining(this.period) < 0){
				//unmuteUser(user, this.users[user].channelID, this.users[user].serverID);
				delete this.users[user];
			}
		}		
	}

	getUser(userID){
		if (!this.users[userID]) return false;
		
		return this.users[userID];
	}

	changePeriod(newValue){this.period = newValue;}
	
	changeLimit(newValue){this.limit = newValue;}

	activate(){this.active = true;}

	deactivate(){this.active = false;}

	isActive(){return this.active;}
}

class ImageTracker extends LimitTracker{
	constructor(options){
		super(options);

		this.type = "imageTracker";
		if (!options.embedsEnabled) this.embedsEnabled = true; else this.embedsEnabled = options.embedsEnabled;
	}

	limitMessage(){
		return ("Image limit is currently " + this.limit + " images.");
	}

	periodMessage(){
		return ("Time period in which images are tracked is currently " + makeReadable(this.period));
	}

	isURLEnabled(){return this.embedsEnabled;}
}

class MessageTracker extends LimitTracker{
	constructor(options){
		super(options);

		this.type = "messageTracker";
	}

	limitMessage(){
		return ("Message limit is currently " + this.limit + " messages.");
	}

	periodMessage(){
		return ("Time period in which messages are tracked is currently " + makeReadable(this.period));
	}
}

class LimitedUser{
	constructor(options){
		this.serverID = options.serverID;
		this.channelID = options.channelID;
		this.type = options.type;
		if (!options.timeStamp && !options.sent){
			this.timeStamp = Date.now();
			this.sent = 0;
		} else {
			this.timeStamp = options.timeStamp;
			this.sent = options.sent;
		}
	}

	addSent(amount){
		if (!amount){this.sent += 1;} else {this.sent += amount;}

		if (this.sent > this.getParent().limit) return true; else return false;
	}

	sentReset(){this.sent = 0;}

	getTimeRemaining(){return this.getParent().period - (Date.now() - this.timeStamp);}

	getSentAmount(){return this.sent;}

	getParent(){
		switch (this.type){
			case "imageTracker":
				return serverStore[this.serverID].channels[this.channelID].imageTracker;
				break;
			case "messageTracker":
				return serverStore[this.serverID].channels[this.channelID].messageTracker;
				break;
			default:
				console.log(this.serverID);
				break;
		}
	}

	warnMessage(channelName){
		return "You've hit the " + this.getParent().limit + " " + this.getParent().type + " limit in `#" + 
				channelName + "`. Please wait " + 
				makeReadable(this.getTimeRemaining()) + " before posting again";
	}
}

global.ImageTracker = ImageTracker;
global.MessageTracker = MessageTracker;
global.User = User;