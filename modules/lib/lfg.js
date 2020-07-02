function activate(schemaObject, botObject, discordObject, appObject, methodObject, commandObject, config, mongoose){
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
				discordObject.Guild.collection.update({_id: server._id}, {$set: {[`modules.lfg.games.${gameName}`]: {role: roleID, channel: channelID}}});
			},
			removeGame : function(gameName, server){
				discordObject.Guild.collection.update({_id: server._id}, {$unset: {[`modules.lfg.games.${gameName}`]: ""}});

				discordObject.Guild.collection.findOne({_id: server._id}).then(function(collection){console.log(collection)});
				console.log(`modules.lfg.games.${gameName}`)
				console.log(`${this.games[gameName]}`)
			}
		};

		schemaObject.discordServerSchemaConstructor.modules.lfg = lfgSchema;

		schemaObject.discordServerSchemaMethods = Object.assign({

		}, schemaObject.discordServerSchemaMethods);
}

exports.activate = activate;