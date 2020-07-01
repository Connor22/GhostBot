// LFG Server Module
	const lfgSchema = new mongoose.Schema({
		enabled : {type: Boolean, default: false},
		games : {type: mongoose.Schema.Types.Mixed},
		name : {type: String, default: "lfg"}
	}, {minimize: false});

	lfgSchema.methods = {
		getGame : function(gameName){
			return this.games[gameName];
		},
		addGame : function(gameName, server, channelID, roleID){
			GhostBot.Discord.Guild.collection.update({_id: server._id}, {$set: {[`modules.lfg.games.${gameName}`]: {role: roleID, channel: channelID}}});
		},
		removeGame : function(gameName, server){
			GhostBot.Discord.Guild.collection.update({_id: server._id}, {$unset: {[`modules.lfg.games.${gameName}`]: ""}});

			GhostBot.Discord.Guild.collection.findOne({_id: server._id}).then(function(collection){console.log(collection)});
			console.log(`modules.lfg.games.${gameName}`)
			console.log(`${this.games[gameName]}`)
		}
	};

	GhostBot.discordServerSchemaConstructor.modules.lfg = lfgSchema;

	GhostBot.discordServerSchemaMethods = Object.assign({

	}, GhostBot.discordServerSchemaMethods);