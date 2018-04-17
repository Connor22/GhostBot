const mongoose = require('mongoose');
// Channel
	GhostBot.channelSchema = new mongoose.Schema(GhostBot.channelSchemaConstructor, {minimize: false});

	GhostBot.channelSchema.methods = {};

	GhostBot.channelSchema.methods = Object.assign(GhostBot.channelSchemaMethods, GhostBot.channelSchema.methods);

// Channel
	GhostBot.userSchema = new mongoose.Schema(GhostBot.userSchemaConstructor, {minimize: false});

	GhostBot.userSchema.methods = {};

	GhostBot.userSchema.methods = Object.assign(GhostBot.userSchemaMethods, GhostBot.userSchema.methods);

// Server
	GhostBot.serverSchemaConstructor.users = [GhostBot.userSchema];

	GhostBot.serverSchema = new mongoose.Schema(GhostBot.serverSchemaConstructor, {minimize: false});

	GhostBot.serverSchema.methods = {
		addUser: function(options){
			this.users.push({_id: options.userID, server: this._id});
		},

		addChannel: function(options){
			new Channel({_id: options.channelID, server: this._id, name: options.channelName});
			this.channels.push(options.channelID);
		},

		getUser: function(userID){
			if (!this.users.id(userID)) this.users.addToSet({_id: userID, server: this._id, modules: {}});
			return this.users.id(userID);
		},

		getChannel: function(channelID, channelName){
			if (!this.channels.id(channelID)) addChannel({channelID: channelID, channelName: channelName})
			return this.channels.id(channelID);
		},

		initialize: function(){
			this.isInitialized = true;
		}
	}

	GhostBot.serverSchema.methods = Object.assign(GhostBot.serverSchemaMethods, GhostBot.serverSchema.methods);