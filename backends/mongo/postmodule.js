function runPostModuleTasks(schemaObject, discordObject, mongoose){
	// Discord
		// Role
			schemaObject.discordRoleSchema = new mongoose.Schema(schemaObject.discordRoleSchemaConstructor, {minimize: false});

		// User
			schemaObject.discordUserSchema = new mongoose.Schema(schemaObject.discordUserSchemaConstructor, {minimize: false});

			schemaObject.discordUserSchema.methods = {};

			schemaObject.discordUserSchema.methods = Object.assign(schemaObject.discordUserSchemaMethods, schemaObject.discordUserSchema.methods);

		// Channel
			schemaObject.discordChannelSchema = new mongoose.Schema(schemaObject.discordChannelSchemaConstructor, {minimize: false});

			schemaObject.discordChannelSchema.methods = {};

			schemaObject.discordChannelSchema.methods = Object.assign(schemaObject.discordChannelSchemaMethods, schemaObject.discordChannelSchema.methods);

		// Server
			schemaObject.discordServerSchemaConstructor.users = [schemaObject.discordUserSchema];

			schemaObject.discordServerSchemaConstructor.roles = [schemaObject.discordRoleSchema];

			schemaObject.discordServerSchema = new mongoose.Schema(schemaObject.discordServerSchemaConstructor, {minimize: false});

			schemaObject.discordServerSchema.methods = {
				// set
					addUser: function(options){
						this.users.cache.push({_id: options.userID, server: this._id});
					},

					addChannel: function(options){
						new discordObject.Channel({_id: options.channelID, server: this._id, name: options.channelName});
						this.channels.cache.push(options.channelID);
					},

					/* addTwitch: function(name){
						if (this.communityid) {
							communityObject.findOne({_id: communityid}).catch(console.log).then((community) => {
								if (!community.twitchChannel) community.addTwitch(name);
							});
						}

						this.twitchChannel = name;
					}, */

					setPrefix: function(newPrefix){
						this.prefix = newPrefix;
					},

				// get
					getUser: function(userID){
						if (!this.users.cache.id(userID)) this.users.cache.addToSet({_id: userID, server: this._id, modules: {}});
						return this.users.cache.id(userID);
					},

					getChannel: function(channelID, channelName){
						if (!this.channels.cache.id(channelID)) this.addChannel({channelID: channelID, channelName: channelName})
						return this.channels.cache.id(channelID);
					},

				// misc
					initialize: function(){
						this.isInitialized = true;
					},

					performMaintenance: function(discordGuild){
						for (let method in discordObject.maintenance){
							discordObject.maintenance[method](this, discordGuild);
						}
					},
			}

			discordObject.maintenance = Object.assign({
				/*fillRoles: function(server, guildObject){
					const roleArray = guildObject.roles.array();
					for (let role in roleArray){
						const roleObject = roleArray[role];
						if (server.roles.indexOf({name: roleObject.name, _id: roleObject.id}) === -1) {
							
						};
					}
				}*/
				delRoles: function(server, discordGuild){
					server.roles = [];
				},
				// addModules: function(server, discordGuild){
				// 	for (let module in GhostBot.modules.lib){
				// 		serverConstructor.modules[module] = {}
				// 	}
				// }
			}, discordObject.maintenance);

			schemaObject.discordServerSchema.methods = Object.assign(schemaObject.discordServerSchemaMethods, schemaObject.discordServerSchema.methods);

	// Twitch
		// Channel
			schemaObject.twitchChannelSchema = new mongoose.Schema(schemaObject.twitchChannelSchemaConstructor, {minimize: false});

			schemaObject.twitchChannelSchema.methods = {
				/* connectDiscord : function(id){
					if (this.communityid) {
						communityObject.findOne({_id: communityid}).catch(console.log).then((community) => {
							if (!community.discordid) community.addDiscord(id);
						});
					}

					this.discordid = id;
				} */
			};

			schemaObject.twitchChannelSchema.methods = Object.assign(schemaObject.twitchChannelSchemaMethods, schemaObject.twitchChannelSchema.methods);

	// Community
		schemaObject.communitySchema = new mongoose.Schema(schemaObject.communitySchemaConstructor, {minimize: false});

		schemaObject.communitySchema.methods = {
			addDiscord : function(id){
				this.discord = id;
			},
			addTwitch : function(name){
				this.twitch = name;
			},
		};

		schemaObject.communitySchema.methods = Object.assign(schemaObject.communitySchemaMethods, schemaObject.communitySchema.methods);

	// User
		schemaObject.userSchema = new mongoose.Schema(schemaObject.userSchemaConstructor, {minimize: false});

		schemaObject.userSchema.methods = {
			// merge : function(tableid){
			// 	usermodelObject.findOne({_id: tableid}).catch(console.log).then((user) => {
					
			// 	});
			// },

		};

		schemaObject.userSchema.methods = Object.assign(schemaObject.userSchemaMethods, schemaObject.userSchema.methods);
}

exports.runPostModuleTasks = runPostModuleTasks;