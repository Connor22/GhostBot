function activate(schemaObject, botObject, discordObject, appObject, methodObject, commandObject, config, mongoose){
	// Administration Server Module
	const administrationSchema = new mongoose.Schema({
		enabled : {type: Boolean, default: false},
		roles : {
			admin : {name: {type: String, default: ""}, id: {type: String, default: ""}},
			mod : {name: {type: String, default: ""}, id: {type: String, default: ""}},
			jmod : {name: {type: String, default: ""}, id: {type: String, default: ""}},
			softban : {type: String, default: ""}
		},
		logChannel : {type: String, default: ""},
		name : {type: String, default: "administration"}
	}, {minimize: false});

	administrationSchema.methods = {};

	schemaObject.discordServerSchemaConstructor.modules.administration = administrationSchema;

	schemaObject.discordUserSchemaConstructor.banned = {type: Boolean, default: false};

	schemaObject.discordServerSchemaMethods = Object.assign({
		// Bans
			ban : function(userID){
				this.getUser(userID).banned = true;
			},
			unban : function(userID){
				this.getUser(userID).banned = false;
			},
			isUserBanned : function(userID){
				return this.getUser(userID).banned;
			},

		// Permissions
			permissionLevelChecker : function(member){
				if (!member) return 0;
				if (member.id === config.ids.dev){
					return 4;
				} else if (member.roles.has(this.modules.administration.roles.admin.id) || member.hasPermission('ADMINISTRATOR')){
					return 3;
				} else if (member.roles.has(this.modules.administration.roles.mod.id)){
					return 2;
				} else  if (member.roles.has(this.modules.administration.roles.jmod.id)) {
					return 1;
				} else {
					return 0;
				}
			},

		// Commands
			checkCommand(command, message){
				for (let module in commandObject){
					if (command in commandObject[module]){
						//if (!this.modules[module].enabled) return {name: "CommandError", message: "That module is disabled"};				
						return commandObject[module][command];
					}
				}

				return {name: "CommandNotFoundError"};
			},

		// Roles
			defineBanRole(roleID){
				this.modules.administration.roles.softban = roleID;
			},
			defineAdminRole(roleID){
				this.modules.administration.roles.admin.id = roleID;
			},
			defineModRole(roleID){
				this.modules.administration.roles.mod.id = roleID;
			},
			defineJModRole(roleID){
				this.modules.administration.roles.jmod.id = roleID;
			},
			

		// Maintenance
			maintenance(guildObject){
			}

	}, schemaObject.discordServerSchemaMethods);

	methodObject.maintenance = Object.assign({
		reban : function(server, guildObject){
			server.users.cache.forEach(function(user){
				if (guildObject.isUserBanned) reban(user, guildObject);
			});
		}
	}, methodObject.maintenance);

	botObject.on('guildMemberAdd', member => {
		try {
			onJoin(member);
		} catch (err) {console.log(err)}
	});

	async function onJoin(member){
		const server = await discordObject.Guild.findOne({_id: member.guild.id});
			
		if (!server){
			console.log("Could not find server");
			return;
		}

		reban(member, server);
	}

	async function reban(member, server){
		if (server.isUserBanned(member.id)) member.roles.add(server.modules.administration.roles.softban.id);
	}
}

exports.activate = activate;