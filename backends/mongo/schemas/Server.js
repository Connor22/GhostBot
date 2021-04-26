module.exports = () => {
	discordServerSchemaConstructor = {
		_id : {type: String, required: [true, "ID must be set!"]},
		communityid : {type: mongoose.Schema.Types.ObjectId},
		twitchChannel : {type: String},
		name : {type: String}, 
		prefix : {type: String, default: "="},
		channels: [{ type: String, ref: 'Channels' }],
		isInitialized: {type: Boolean, default: false},
		modules: {},
	};

	discordRoleSchemaConstructor = {
		_id: {type: String, required: [true, "ID must be set!"]},
		name: {type: String}
	};

	discordServerSchema = new mongoose.Schema(construct.discordServerSchemaConstructor, {minimize: false});

	discordRoleSchema = new mongoose.Schema(construct.discordRoleSchemaConstructor, {minimize: false});

	discordServerSchema.roles = [discordRoleSchema];

	discordServerSchema.methods = {
		// Prefix
			setPrefix: (newPrefix) => {
				this.prefix = newPrefix;
			},

			getPrefix: () => {
				return this.prefix;
			},

		// Modules
			enable: () => {

			},

			disable: () => {

			},

		// Attribute manipulation
			get: () => {

			}, 

			set: () => {

			},

		// Linking Channels and Users
			addChannel: async function(backend, options){
				new backend.Channel({_id: options.id, server: this._id, name: options.channelName});

				this.channels.push(options.id);
			},

			addUser: async function(backend, options){
				let user = await backend.db.User.findOne({_id: options.id, server: this._id, name: options.channelName});
				
				if (!user) user = new backend.db.User({_id: options.id, servers: {}, name: options.name});	
				
				user.servers[this._id] = {
					modules: {}
				};
			},
	};

	return discordServerSchema;
}