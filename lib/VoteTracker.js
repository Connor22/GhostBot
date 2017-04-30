class VoteTracker{
	constructor(options){
		this.messages = {};
		this.users = {};
		this.serverID = options.serverID;
		this.channelID = options.channelID;
	}

	addMessage(messageID, userID){
		this.messages[messageID] = new VoteMessage({'messageID': messageID, 'userID': userID});
	}


}

class VoteMessage{
	constructor(options){
		this.reactors = [];
		this.messageID = options.messageID;
		this.userID = options.userID;
	}

	addReaction(userID){
		if (this.reactors.indexOf(userID) === -1) this.reactors.push(userID); 
	}
}

class Voter{
	constructor(options){
		this.reactions = [];
	}

	addVote(){
		if (this.reactors.indexOf(userID) === -1) this.reactors.push(userID); 
	}
}