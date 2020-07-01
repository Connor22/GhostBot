// Usercustom Server Module
	const usercustomSchema = new mongoose.Schema({
		enabled : {type: Boolean, default: false},
		joinables : {
			channels : [{type: String}],
			roles :[{type: String}]
		},
		superRoles: {

		},
		default: [{type: String}],
		name : {type: String, default: "usercustom"}
	}, {minimize: false});

	GhostBot.discordServerSchemaConstructor.modules.usercustom = usercustomSchema;

	GhostBot.discordServerSchemaMethods = Object.assign({
		isRoleJoinable : function(roleID){
			return this.modules.usercustom.joinables.roles.includes(roleID);
		},
		isChannelShowable : function(channelID){
			return this.modules.usercustom.joinables.channels.includes(channelID);
		},
		defineJoinableRole : function(roleID){
			this.modules.usercustom.joinables.roles.addToSet(roleID);
		},
		defaultRoles(){
			return this.modules.usercustom.default;
		},
		setDefaultRoles(roleArray){
			this.modules.usercustom.default = roleArray;
		},

	}, GhostBot.discordServerSchemaMethods);

	GhostBot.on('guildMemberAdd', member => {
		try {
			onJoin(member);
		} catch (err) {console.log(err)}
	});

	async function addDefaultRole(member, server){
		if (server.modules.usercustom.default && server.modules.usercustom.default.length > 0) {
			for (var i = server.modules.usercustom.default.length - 1; i >= 0; i--) {
				member.addRole(server.modules.usercustom.default[i]).catch(console.log);
			}
			// for (var role in server.modules.usercustom.default){
			// 	console.log(server.modules.usercustom.default[role]);
			// 	member.addRole(server.modules.usercustom.default[role]).catch(console.log);
			// }
		}
	}

	async function onJoin(member){
		const server = await GhostBot.Discord.Guild.findOne({_id: member.guild.id});

		if (!server || !server.modules.usercustom.enabled){
			console.log(`${server.name} does not have usercustom enabled.`);
			return;
		}

		addDefaultRole(member, server);
	}