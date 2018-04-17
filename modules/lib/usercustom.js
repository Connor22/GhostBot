// Usercustom Server Module
	const usercustomSchema = new mongoose.Schema({
		enabled : {type: Boolean, default: false},
		joinables : {
			channels : [{type: String}],
			roles :[{type: String}]
		},
		name : {type: String, default: "usercustom"}
	}, {minimize: false});

	GhostBot.serverSchemaConstructor.modules.usercustom = usercustomSchema;

	GhostBot.serverSchemaMethods = Object.assign({
		isRoleJoinable : function(roleID){
			return this.modules.usercustom.joinables.roles.includes(roleID);
		},
		isChannelShowable : function(channelID){
			return this.modules.usercustom.joinables.channels.includes(channelID);
		},
		defineJoinableRole : function(roleID){
			this.modules.usercustom.joinables.roles.addToSet(roleID);
		}
	}, GhostBot.serverSchemaMethods);