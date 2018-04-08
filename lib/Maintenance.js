function verifyStaticStorage(object){
	for (let serverID in serverStore){
		const server = serverStore[serverID];
		const static = server.static;

		if (!static.config ||
			!static.info){
			if (static.info && static.info.name) console.log(`${static.info.name} does not have all the proper static fields`); 
			else console.log(`${serverID} does not have all the proper static fields`);
		}

		serverMaintenance(server, serverID);

		for (let channelID in server.channels){
			const channel = server.channels[channelID];
			channelMaintenance(channel, channelID);
		}

		for (let userID in server.users){
			const user = server.users[userID];
			userMaintenance(user, userID, serverID);
		}
	}
}

function serverMaintenance(server, serverID){
	const static = server.static;

	//Default container check
		if (!server.users) server.users = {};
		if (!server.channels) server.channels = {};

	/* Added voting and votes container - 29/06/2016
		if (!server.votes) server.votes = {};
		if (!static.config.inputVoteChannel) static.config.inputVoteChannel = "";
		if (!static.config.outputVoteChannel) static.config.outputVoteChannel = "";

		if (!static.voteTracker){
			static.voteTracker = {
				type: "vote",
				container: "votes",
				period: parseTime(24, "hours"),
				votes: {},
				tokenPeriod: parseTime(168, "hours")
			}
		}
	*/

	/* Added vote number tracker
		if (!static.voteTracker.number) static.voteTracker.number = 0;
		for (let vote in static.voteTracker.votes){
			if (!static.voteTracker.votes[vote].number) static.voteTracker.votes[vote].number = 0;
		}
	*/

	/* Added completed vote container
		if (!static.voteTracker.completedVotes) static.voteTracker.completedVotes = {};
	*/

	/* Reworked command structure */
	if (static.voteTracker){
		const newStatic = {
			info : {
				id : static.info.id,
				name : static.info.name
			},
			config : {
				setupUserID : static.config.setupUserID,
				prefix : static.config.prefix,
			},
			modules: {
				voting: {
					enabled: false,
					voteTracker : static.voteTracker,
					voteChannels: {
						input: static.config.voteInputChannel,
						output: static.config.voteOutputChannel
					}
				},
				administration: {
					enabled: true,
					roles : {
						admin : static.roles.admin,
						mod : static.roles.mod,
						jmod : static.roles.jmod,
						softban : static.roles.softban
					},
					logChannel : static.config.logChannel
				},
				rules: {
					enabled: false,
					disclaimer : static.rules.disclaimer,
					sections : static.rules.sections
				},
				usercustom: {
					enabled: false,
					joinables : {
						channels : static.joinables.channels,
						roles : static.joinables.roles
					}
				}
			}
		}

		newStatic.modules.voting.voteTracker.tokenAmount = 1;
		if (!newStatic.modules.voting.voteTracker.container) newStatic.modules.voting.voteTracker.container = "votes";


		server.static = newStatic;
	}

	const modules = Object.keys(loadedModules);

	for (let i in modules){
		if (!static.modules[modules[i]]) static.modules[modules[i]] = {enabled: false};
	}
}

function channelMaintenance(channel, channelID){
	// Default Static Check
		const static = channel.static
		if (!static.imageTracker) {
			static.imageTracker = {
				container: "users",
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
				container: "users",
				type: "message",
				limit: 5,
				period: 20000,
				active: false,
				users: {}
			}
		}

		if (!static.rules) static.rules = {};

		if (!static.config) static.config = {addPostVoting: false};

	/* Changed var name - 29/06/2016
		if (!static.imageTracker.container) static.imageTracker.container = "users";
		if (!static.messageTracker.container) static.messageTracker.container = "users";
		changeVarName(channel.static, "addVoting", "addPostVoting");
	*/
}

function userMaintenance(user, userID, serverID){
	// Default Static Check
		const static = user.static;
		if (!static.info.id) static.info.id = userID;
		if (!static.info.serverID) static.info.serverID = serverID;
		//if (!static.modules.administration.isBanned) static.modules.administration.isBanned = false;

	/* Added voting
		if (!user.static.modules.voting.modules.voting.voteTokenTracker) user.static.modules.voting.modules.voting.voteTokenTracker = {};
		const tracker = user.static.modules.voting.modules.voting.voteTokenTracker;
		if (tracker.voteTokens) delete tracker.voteTokens;
		if (tracker.tokens != 0 && !tracker.tokens){
			console.error(`Invalid number of tokens`);
			tracker.tokens = 3;
		} 
		if (!tracker.timeStamp) tracker.timeStamp = Date.now();
	*/

	/* Added modules to user class */
		if (!static.modules){
			const newStatic = {
				info : {
					serverID: static.info.serverID,
					id: static.info.userID
				},
				modules: {
					voting: {
						voteTokenTracker: static.voteTokenTracker
					},
					administration: {
						isBanned: static.isBanned
					},
					levelling: {
						level: 0,
						xp: 0,
						lastMessageTimestamp: Date.now()
					}
				}
			}

			user.static = newStatic;
		}

		if (!user.static.modules.voting) user.static.modules.voting = {};
		if (!user.static.modules.voting.voteTokenTracker) user.static.modules.voting.voteTokenTracker = {tokens: 1, timeStamp: Date.now()};
		
}

function changeVarName(object, oldVar, newName){
	if (object[oldVar]){
		object[newName] = object[oldVar];
		delete object[oldVar];
	}
}

global.verifyStaticStorage = verifyStaticStorage;