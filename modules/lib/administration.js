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

GhostBot.serverSchemaConstructor.modules.administration = administrationSchema;

GhostBot.userSchemaConstructor.banned = {type: Boolean, default: false};

GhostBot.serverSchemaMethods = Object.assign({
	ban : function(userID){
		this.getUser(userID).banned = true;
	},
	unban : function(userID){
		this.getUser(userID).banned = false;
	},
	isUserBanned : function(userID){
		return this.getUser(userID).banned;
	},
	permissionLevelChecker : function(member){
		if (!member) return 0;
		if (member.roles.has(this.modules.administration.roles.admin.id) || member.hasPermission('ADMINISTRATOR')){
			return 3;
		} else if (member.roles.has(this.modules.administration.roles.mod.id)){
			return 2;
		} else  if (member.roles.has(this.modules.administration.roles.jmod.id)) {
			return 1;
		} else {
			return 0;
		}
	},
	checkCommand(command, message){
		for (let module in GhostBot.modules.commands){
			if (command in GhostBot.modules.commands[module]){
				//if (!this.modules[module].enabled) return {name: "CommandError", message: "That module is disabled"};				
				return GhostBot.modules.commands[module][command];
			}
		}

		return {name: "CommandNotFoundError"};
	},
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
	}
}, GhostBot.serverSchemaMethods);

GhostBot.on('guildMemberAdd', member => {
	if (serverStore[member.guild.id].users[member.id] && serverStore[member.guild.id].users[member.id].modules.administration.isBanned){
		member.addRole(serverStore[member.guild.id].static.modules.administration.roles.softban);
	}
});