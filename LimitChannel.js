function LimitedChannel (postLimit, limitPeriod){ //abstract
	if (!postLimit){this.limit = 5;} else {this.limit = postLimit;}
	if (!limitPeriod){this.period = 20000;} else {this.period = limitPeriod;}
	this.users = {};
	this.addUser = function (userID){this.users[userID] = new User(this);};
	this.update = function(){
		for (var user in this.users){
			if (this.users[user].getTimeRemaining(this.period) < 0){
				delete this.users[user];
			}
		}
	};
	this.getUser = function(userID, addUserFlag){
		if(!this.users[userID]){
			if (addUserFlag){
				this.addUser(userID);
			} else {
				return false;
			}
		} 
		return this.users[userID];
	};
	this.changePeriod = function(newValue){this.period = newValue;};
	this.changeLimit = function(newValue){this.limit = newValue;};	
}

function ImageChannel (postLimit, limitPeriod, url){
	this.inherit = LimitedChannel;
	this.inherit(postLimit, limitPeriod);
	this.type = "image";
	this.limitMessage = function(){return ("Image limit is currently " + this.limit + " images.");};
	this.periodMessage = function(){return ("Time period in which images are tracked is currently " + makeReadable(this.period));};
	this.isURLEnabled = function(){return true;};
}

function MessageChannel (postLimit, limitPeriod){
	this.inherit = LimitedChannel;
	this.inherit(postLimit, limitPeriod);
	this.type = "message";
	this.limitMessage = function(){return ("Message limit is currently " + this.limit + " messages.");};
	this.periodMessage = function(){return ("Time period in which messages are tracked is currently " + makeReadable(this.period));};
}

function User (parent){
	this.parent = parent;
	this.timeStamp = Date.now();
	this.sent = 0;
	this.addSent = function(amount){
		if (!amount){this.sent += 1;} else {this.sent += amount;}
		if (this.sent > this.parent.limit){
			return true;
		} else {
			return false;
		}
	};
	this.sentReset = function(){this.sent = 0;};
	this.getTimeRemaining = function(){return this.parent.period - (Date.now() - this.timeStamp);};
	this.getSentAmount = function(){return this.sent;};
	this.warnMessage = function(channelName){return ("You've gone over the " + this.parent.limit + " " + this.parent.type + " limit in `#" + 
				channelName + "`. Please wait another " + 
				makeReadable(this.getTimeRemaining()));};
}

function makeReadable(milliseconds){
	if (milliseconds > 3600000){
		return (Math.floor(milliseconds/3600000) + " hours");
	} else if (milliseconds > 60000){
		return (Math.floor(milliseconds/60000) + " minutes");
	} else {
		return (Math.floor(milliseconds/1000) + " seconds");
	} 
}

/* FILE OPERATIONS */
	function load(obj){
		var newDict = {};
		for (var dict in obj){
			newDict[dict] = {};
			for (var chID in obj[dict]){
				if (chID != "type"){
					var oldObject = obj[dict][chID];
					if (obj[dict].type === "image"){
						newDict[dict][chID] = new ImageChannel(oldObject.limit, oldObject.period);
					} else if (obj[dict].type === "message"){
						newDict[dict][chID] = new MessageChannel(oldObject.limit, oldObject.period);	
					}
				} else {
					newDict[dict].type = obj[dict][chID];
				}
			}
		}

		return newDict;
	}

	function stripUsers(obj){
		var newDict = Object.assign({}, obj);
		for (var dict in newDict){
			for (var chID in newDict[dict]){
				newDict[dict][chID].users = {};
			}
		}
		return newDict;
	}

exports.ImageChannel = ImageChannel;
exports.MessageChannel = MessageChannel;
exports.load = load;
exports.stripUsers = stripUsers;