/* ESSENTIAL CODE */
	const mongoose = require("mongoose");

	exports.runPreModuleTasks = require("./premodule.js").runPreModuleTasks;
	exports.runPostModuleTasks = require("./postmodule.js").runPostModuleTasks;

/* CONNECTIONS */
	const options = {
		autoReconnect:true,

		poolSize: 20,
		socketTimeoutMS: 480000,
		keepAlive: 300000,

		keepAliveInitialDelay : 300000,
		connectTimeoutMS: 30000,
		reconnectTries: Number.MAX_VALUE,
		reconnectInterval: 1000,
		useNewUrlParser: true
	}
	
	const mainDBConnection = mongoose.createConnection('mongodb://mongo:27017/bot', options);
	const discordDBConnection = mongoose.createConnection('mongodb://mongo:27017/discord', options);
	const twitchDBConnection = mongoose.createConnection('mongodb://mongo:27017/twitch', options);

/* CONTAINERS */
	const db = {
		discord = {},
		twitch = {},
		main = {}
	};

/* MODELS */
	db.discord.Guild = discordDBConnection.model('Guild', schemas.discordServerSchema);
	db.discord.Channel = discordDBConnection.model('Channel', schemas.discordChannelSchema);

	db.main.Community = mainDBConnection.model('Community', schemas.communitySchema);
	db.main.UserModel = mainDBConnection.model('User', schemas.userSchema);

	db.twitch.Channel = twitchDBConnection.model('Channel', schemas.twitchChannelSchema);

/* GET METHODS */
	exports.maintenance = async function(bot){
		for (let guild in bot.guilds.cache.array()){
			const guildObject = bot.guilds.cache.array()[guild];
			db.discord.Guild.findOne({_id: guildObject.id}).then((server) => {
				serverMaintenance(server, guildObject);
				server.save();
			});
		}
	}

	exports.save = function(server, channel, modified){
		if (modified) server.markModified(modified);
		if (debug) console.log(`About to save server`);
		server.save(function (err, server) {   
		  if (err) return console.log(err);    
		});
		if (debug) console.log(`About to save channel`);
		channel.save(function (err, channel) {   
		  if (err) return console.log(err);    
		});
	}