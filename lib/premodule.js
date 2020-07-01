const mongoose = require('mongoose');

// Community
	GhostBot.communitySchemaConstructor = {
		discordid: String,
		twitchChannel: String
	};

	GhostBot.communitySchemaMethods = {};

// Twitch
	// Channel
		GhostBot.twitchChannelSchemaConstructor = {
			name : {type: String, required: [true, "name must be set!"]},
			discordid : {type: String},
			communityid : {type: mongoose.Schema.Types.ObjectId},
			prefix : {type: String, default: "="},
			modules: {}
		};

		GhostBot.twitchChannelSchemaMethods = {};

// User
	GhostBot.userSchemaConstructor = {
		twitch: {
			name: {type: String}
		},
		discord: {
			id: {type: String}
		},
		modules: {}
	};

	GhostBot.userSchemaMethods = {};

// DiscordChannel
	// DiscordServer
		GhostBot.discordServerSchemaConstructor = {
			_id : {type: String, required: [true, "ID must be set!"]},
			communityid : {type: mongoose.Schema.Types.ObjectId},
			twitchChannel : {type: String},
			name : {type: String}, 
			prefix : {type: String, default: "="},
			channels: [{ type: String, ref: 'Channels' }],
			isInitialized: {type: Boolean, default: false},
			modules: {},
		};

		GhostBot.discordServerSchemaMethods = {};

	// DiscordChannel
		GhostBot.discordChannelSchemaConstructor = {
			_id : {type: String, required: [true, "id must be set!"]},
			server: {type: String, required: [true, "server must be set!"]}, 
			modules: {}
		};

		GhostBot.discordChannelSchemaMethods = {}

	// DiscordUser
		GhostBot.discordUserSchemaConstructor = {
			_id : {type: String, required: [true, "id must be set!"]},
			server: {type: String, required: [true, "server must be set!"]},
			modules: {},
			tableid: {type: mongoose.Schema.Types.ObjectId}
		};

		GhostBot.discordUserSchemaMethods = {}

	// Roles
		GhostBot.discordRoleSchemaConstructor = {
			_id: {type: String, required: [true, "ID must be set!"]},
			name: {type: String}
		}

GhostBot.Discord.maintenance = {};

GhostBot.methods = {}
GhostBot.methods.preCheck = {};
GhostBot.methods.reactionAdd = {};
GhostBot.methods.reactionRemove = {};