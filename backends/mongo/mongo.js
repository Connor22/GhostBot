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
	
	const mainDBConnection = mongoose.createConnection('mongodb://mongo:27017/ghostbot', options);
	const discordDBConnection = mongoose.createConnection('mongodb://mongo:27017/discord', options);
	const twitchDBConnection = mongoose.createConnection('mongodb://mongo:27017/twitch', options);

/* CONFIG */
	const db = {
		discord = {},
		twitch = {},
		main = {}
	};

	exports.schemas = {};
	exports.methods = {};

/* MODELS */
	db.discord.Guild = discordDBConnection.model('Guild', schemas.discordServerSchema);
	db.discord.Channel = discordDBConnection.model('Channel', schemas.discordChannelSchema);

	db.main.Community = mainDBConnection.model('Community', schemas.communitySchema);
	db.main.UserModel = mainDBConnection.model('User', schemas.userSchema);

	db.twitch.Channel = twitchDBConnection.model('Channel', schemas.twitchChannelSchema);

/* METHODS */
	exports.getServer = async function(id, verb){
		let server = db.discord.Guild.findOne({_id: message.guild.id});

		// Handle first-time server access
			if (!server && can_initialize){
				if (debug) console.log("Constructing Server");
				server = await constructServer(message);
				server.save(function (err, server) {   
			  		if (err) return console.log(err);    
				});
			}

		// Useful shortcut
			
			// console.log(message.split);
			if (!server.isInitialized && !verb === "initialize") return;
	};

	exports.getChannel = {
		let channel = await db.discord.Channel.findOne({_id: message.channel.id});
		// Handle first-time channel access
			if (!channel){
				channel = new db.discord.Channel({_id: message.channel.id, name: message.channel.name, server: message.channel.parentID})
				server.channels.addToSet(message.channel.id);
				channel.save(function (err, channel) {   
			  		if (err) return console.log(err);    
				});
				server.save(function (err, server) {   
			  		if (err) return console.log(err);    
				});
			}
	}

	async function constructServer(message){
		const serverConstructor = {
			_id: message.guild.id, 
			name: message.guild.name,
			modules: {}
		};

		for (let module in commands){
			serverConstructor.modules[module] = {}
		};

		return new db.discord.Guild(serverConstructor);
	}

	exports.performMaintenance = async function(){
		for (let guild in GhostBot.guilds.cache.array()){
			const guildObject = GhostBot.guilds.cache.array()[guild];
			db.discord.Guild.findOne({_id: guildObject.id}).then((server) => {
				server.performMaintenance(guildObject);
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