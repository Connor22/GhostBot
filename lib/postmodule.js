const mongoose = require('mongoose');
// Discord
	// Role
		GhostBot.discordRoleSchema = new mongoose.Schema(GhostBot.discordRoleSchemaConstructor, {minimize: false});

	// User
		GhostBot.discordUserSchema = new mongoose.Schema(GhostBot.discordUserSchemaConstructor, {minimize: false});

		GhostBot.discordUserSchema.methods = {};

		GhostBot.discordUserSchema.methods = Object.assign(GhostBot.discordUserSchemaMethods, GhostBot.discordUserSchema.methods);

	// Channel
		GhostBot.discordChannelSchema = new mongoose.Schema(GhostBot.discordChannelSchemaConstructor, {minimize: false});

		GhostBot.discordChannelSchema.methods = {};

		GhostBot.discordChannelSchema.methods = Object.assign(GhostBot.discordChannelSchemaMethods, GhostBot.discordChannelSchema.methods);

	// Server
		GhostBot.discordServerSchemaConstructor.users = [GhostBot.discordUserSchema];

		GhostBot.discordServerSchemaConstructor.roles = [GhostBot.discordRoleSchema];

		GhostBot.discordServerSchema = new mongoose.Schema(GhostBot.discordServerSchemaConstructor, {minimize: false});

		GhostBot.discordServerSchema.methods = {
			// set
				addUser: function(options){
					this.users.push({_id: options.userID, server: this._id});
				},

				addChannel: function(options){
					new GhostBot.Discord.Channel({_id: options.channelID, server: this._id, name: options.channelName});
					this.channels.push(options.channelID);
				},

				addTwitch: function(name){
					if (this.communityid) {
						GhostBot.Community.findOne({_id: communityid}).catch(console.log).then((community) => {
							if (!community.twitchChannel) community.addTwitch(name);
						});
					}

					this.twitchChannel = name;
				},

				setPrefix: function(newPrefix){
					this.prefix = newPrefix;
				},

			// get
				getUser: function(userID){
					if (!this.users.id(userID)) this.users.addToSet({_id: userID, server: this._id, modules: {}});
					return this.users.id(userID);
				},

				getChannel: function(channelID, channelName){
					if (!this.channels.id(channelID)) this.addChannel({channelID: channelID, channelName: channelName})
					return this.channels.id(channelID);
				},

			// misc
				initialize: function(){
					this.isInitialized = true;
				},

				performMaintenance: function(discordGuild){
					for (let method in GhostBot.Discord.maintenance){
						GhostBot.Discord.maintenance[method](this, discordGuild);
					}
				},
		}

		GhostBot.Discord.maintenance = Object.assign({
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
		}, GhostBot.Discord.maintenance);

		GhostBot.discordServerSchema.methods = Object.assign(GhostBot.discordServerSchemaMethods, GhostBot.discordServerSchema.methods);

// Twitch
	// Channel
		GhostBot.twitchChannelSchema = new mongoose.Schema(GhostBot.twitchChannelSchemaConstructor, {minimize: false});

		GhostBot.twitchChannelSchema.methods = {
			connectDiscord : function(id){
				if (this.communityid) {
					GhostBot.Community.findOne({_id: communityid}).catch(console.log).then((community) => {
						if (!community.discordid) community.addDiscord(id);
					});
				}

				this.discordid = id;
			}
		};

		GhostBot.twitchChannelSchema.methods = Object.assign(GhostBot.twitchChannelSchemaMethods, GhostBot.twitchChannelSchema.methods);

// Community
	GhostBot.communitySchema = new mongoose.Schema(GhostBot.communitySchemaConstructor, {minimize: false});

	GhostBot.communitySchema.methods = {
		addDiscord : function(id){
			this.discord = id;
		},
		addTwitch : function(name){
			this.twitch = name;
		},
	};

	GhostBot.communitySchema.methods = Object.assign(GhostBot.communitySchemaMethods, GhostBot.communitySchema.methods);

// User
	GhostBot.userSchema = new mongoose.Schema(GhostBot.userSchemaConstructor, {minimize: false});

	GhostBot.userSchema.methods = {
		merge : function(tableid){
			GhostBot.User.findOne({_id: tableid}).catch(console.log).then((user) => {
				
			});
		},

	};

	GhostBot.userSchema.methods = Object.assign(GhostBot.userSchemaMethods, GhostBot.userSchema.methods);