exports.runPostModuleTasks = function(construct, discordDB, mongoose){
	// Discord
		// Role
			construct.discordRoleSchema = new mongoose.Schema(construct.discordRoleSchemaConstructor, {minimize: false});

		// User
			construct.discordUserSchema = new mongoose.Schema(construct.discordUserSchemaConstructor, {minimize: false});

			construct.discordUserSchema.methods = {};

			construct.discordUserSchema.methods = Object.assign(construct.discordUserSchemaMethods, construct.discordUserSchema.methods);

		// Channel
			construct.discordChannelSchema = new mongoose.Schema(construct.discordChannelSchemaConstructor, {minimize: false});

			construct.discordChannelSchema.methods = {};

			construct.discordChannelSchema.methods = Object.assign(construct.discordChannelSchemaMethods, construct.discordChannelSchema.methods);

		// Server
			construct.discordServerSchemaConstructor.users = [construct.discordUserSchema];

			construct.discordServerSchemaConstructor.roles = [construct.discordRoleSchema];

			construct.discordServerSchema = new mongoose.Schema(construct.discordServerSchemaConstructor, {minimize: false});

			construct.discordServerSchema.methods = {
				// Prefix
					setPrefix: (newPrefix) => {
						this.prefix = newPrefix;
					},

					getPrefix: () => {
						return this.prefix;
					},

				// Modules
					addModule: () => {

					},

					enable: () => {

					},

					disable: () => {

					},

				// Attribute manipulation
					addAttr: () => {

					},

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
						let user = await backend.User.findOne({_id: options.id, server: this._id, name: options.channelName});
						
						if (!user) user = new backend.User({_id: options.id, servers: {}, name: options.name});	
						
						user.servers[this._id] = {
							modules: {}
						};
					},

			}
}