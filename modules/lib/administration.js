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

GhostBot.discordServerSchemaConstructor.modules.administration = administrationSchema;

GhostBot.discordUserSchemaConstructor.banned = {type: Boolean, default: false};

GhostBot.discordServerSchemaMethods = Object.assign({
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
			if (member.id === GhostBot.config.ids.dev){
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
			for (let module in GhostBot.modules.commands){
				if (command in GhostBot.modules.commands[module]){
					//if (!this.modules[module].enabled) return {name: "CommandError", message: "That module is disabled"};				
					return GhostBot.modules.commands[module][command];
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

}, GhostBot.discordServerSchemaMethods);

GhostBot.Discord.maintenance = Object.assign({
	reban : function(server, guildObject){
		server.users.forEach(function(user){
			if (guildObject.isUserBanned) reban(user, guildObject);
		});
	}
}, GhostBot.Discord.maintenance);

GhostBot.on('guildMemberAdd', member => {
	try {
		onJoin(member);
	} catch (err) {console.log(err)}
});

async function onJoin(member){
	const server = await GhostBot.Discord.Guild.findOne({_id: member.guild.id});
		
	if (!server){
		console.log("Could not find server");
		return;
	}

	reban(member, server);
}

async function reban(member, server){
	if (server.isUserBanned(member.id)) member.addRole(server.modules.administration.roles.softban.id);
}

