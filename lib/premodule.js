function runPreModuleTasks(schemaObject, methodObject, mongoose){
	// Community
		schemaObject.communitySchemaConstructor = {
			discordid: String,
			twitchChannel: String
		};

		schemaObject.communitySchemaMethods = {};

	// Twitch
		// Channel
			schemaObject.twitchChannelSchemaConstructor = {
				name : {type: String, required: [true, "name must be set!"]},
				discordid : {type: String},
				communityid : {type: mongoose.Schema.Types.ObjectId},
				prefix : {type: String, default: "="},
				modules: {}
			};

			schemaObject.twitchChannelSchemaMethods = {};

	// User
		schemaObject.userSchemaConstructor = {
			twitch: {
				name: {type: String}
			},
			discord: {
				id: {type: String}
			},
			modules: {}
		};

		schemaObject.userSchemaMethods = {};

	// DiscordChannel
		// DiscordServer
			schemaObject.discordServerSchemaConstructor = {
				_id : {type: String, required: [true, "ID must be set!"]},
				communityid : {type: mongoose.Schema.Types.ObjectId},
				twitchChannel : {type: String},
				name : {type: String}, 
				prefix : {type: String, default: "="},
				channels: [{ type: String, ref: 'Channels' }],
				isInitialized: {type: Boolean, default: false},
				modules: {},
			};

			schemaObject.discordServerSchemaMethods = {};

		// DiscordChannel
			schemaObject.discordChannelSchemaConstructor = {
				_id : {type: String, required: [true, "id must be set!"]},
				server: {type: String, required: [true, "server must be set!"]}, 
				modules: {}
			};

			schemaObject.discordChannelSchemaMethods = {}

		// DiscordUser
			schemaObject.discordUserSchemaConstructor = {
				_id : {type: String, required: [true, "id must be set!"]},
				server: {type: String, required: [true, "server must be set!"]},
				modules: {},
				tableid: {type: mongoose.Schema.Types.ObjectId}
			};

			schemaObject.discordUserSchemaMethods = {}

		// Roles
			schemaObject.discordRoleSchemaConstructor = {
				_id: {type: String, required: [true, "ID must be set!"]},
				name: {type: String}
			}

	methodObject.maintenance = {};
	methodObject.preCheck = {};
	methodObject.reactionAdd = {};
	methodObject.reactionRemove = {};
}

exports.runPreModuleTasks = runPreModuleTasks