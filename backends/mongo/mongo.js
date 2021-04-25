/* ESSENTIAL CODE */
	const mongoose = require("mongoose");

	const runPreModuleTasks = require("./premodule.js").runPreModuleTasks;
	const runPostModuleTasks = require("./postmodule.js").runPostModuleTasks;

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

/* CONTAINERS */
	const db = {
		discord = {}
	};

/* MODELS */
	db.discord.Guild = discordDBConnection.model('Guild', schemas.discordServerSchema);
	db.discord.Channel = discordDBConnection.model('Channel', schemas.discordChannelSchema);

/* MODULE SETUP */
	const construct = {};

	exports.premodule = () => {
		runPreModuleTasks(mongoose, construct);	
	};

	exports.postmodule = () => {
		runPostModuleTasks(mongoose, construct);
	};

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

	exports.save = (serverid, channelid, modified) => {
		if (global.debug) console.log(`About to save server`);
		if (modified) server.markModified(modified);
		server.save(function (err, server) {   
		  if (err) return console.log(err);    
		});

		if (channelid) {
			if (global.debug) console.log(`About to save channel`);
			const channel = await 
			channel.save(function (err, channel) {   
		  		if (err) return console.log(err);    
			});
		}
	}