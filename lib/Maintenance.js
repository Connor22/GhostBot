function verifyStaticStorage(object){
	for (let serverID in serverStore){
		const server = serverStore[serverID];
		const static = server.static;

		if (!static.config ||
			!static.info ||
			!static.roles ||
			!static.rules ||
			!static.joinables){
			if (static.info && static.info.name) console.log(`${static.info.name} does not have all the proper static fields`); 
			else console.log(`${serverID} does not have all the proper static fields`);
		}

		serverMaintenance(server, serverID);

		for (let channelID in server.channels){
			const channel = server.channels[channelID];
			channelMaintenance(channel, channelID);
		}

	}
}

function serverMaintenance(server, serverID){
	//Default container check
		if (!server.users) server.users = {};
		if (!server.channels) server.channels = {};

	// Added voting and votes container - 29/06/2016
		if (!server.votes) server.votes = {};
		if (!server.static.config.inputVoteChannel) server.static.config.inputVoteChannel = "";
		if (!server.static.config.outputVoteChannel) server.static.config.outputVoteChannel = "";

		if (!server.static.voteTracker){
			server.static.voteTracker = {
				type: "vote",
				container: "votes",
				period: parseTime(24, "hours");
				votes: {},
				tokenPeriod: parseTime(168, "hours");
			}
		}
}

function channelMaintenance(channel, channelID){
	// Default Static Check
		const static = channel.static
		if (!static.imageTracker) {
			static.imageTracker = {
				type: "image",
				limit: 5,
				period: 20000,
				active: false,
				users: {},
				trackLinks: false,
			}
		}

		if (!static.messageTracker) {
				static.messageTracker = {
					type: "message",
					limit: 5,
					period: 20000,
					active: false,
					users: {}
				}
			}
		}

		if (!static.rules) static.rules = {};

		if (!static.config) static.config = {addPostVoting: false};

	// Changed var name - 29/06/2016
		changeVarName(channel.static, "addVoting", "addPostVoting");
}

function userMaintenance(user, userID){
	// Default Static Check
		const static = user.static;
		if (!static.info.id) static.info.id = userID;
		if (!static.isBanned) static.isBanned = false;

	// Added voting
		if (!user.static.voteTokenTracker) user.static.voteTokenTracker = {};
		const tracker = user.static.voteTokenTracker;
		if (tracker.tokens != 0 && !tracker.tokens) tracker.tokens = 3;
		if (!tracker.timeStamp) tracker.timeStamp = Date.now();
	return;
}

function changeVarName(object, oldVar, newName){
	if (object[oldvar]){
		object[newName] = object[oldVar];
		delete object[oldVar];
	}
}

global.verifyStaticStorage = verifyStaticStorage;