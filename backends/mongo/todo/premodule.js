exports.runPreModuleTasks = (mongoose, construct) => {
	construct.discordServerSchemaConstructor = {
		_id : {type: String, required: [true, "ID must be set!"]},
		communityid : {type: mongoose.Schema.Types.ObjectId},
		twitchChannel : {type: String},
		name : {type: String}, 
		prefix : {type: String, default: "="},
		channels: [{ type: String, ref: 'Channels' }],
		isInitialized: {type: Boolean, default: false},
		modules: {},
	};

	construct.discordChannelSchemaConstructor = {
		_id : {type: String, required: [true, "id must be set!"]},
		server: {type: String, required: [true, "server must be set!"]}, 
		modules: {}
	};

	construct.discordUserSchemaConstructor = {
		_id : {type: String, required: [true, "id must be set!"]},
		server: {type: String, required: [true, "server must be set!"]},
		modules: {},
	};

	construct.discordRoleSchemaConstructor = {
		_id: {type: String, required: [true, "ID must be set!"]},
		name: {type: String}
	};

	return construct;
}