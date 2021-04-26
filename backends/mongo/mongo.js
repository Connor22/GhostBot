/* ESSENTIAL CODE */
	const mongoose = require("mongoose");

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
		discord: {}
	};

/* MODELS */
	db.discord.Guild = discordDBConnection.model('Guild', discordServerSchema);
	db.discord.Channel = discordDBConnection.model('Channel', discordChannelSchema);
	db.discord.User = discordDBConnection.model('User', discordUserSchema);

module.exports = db;