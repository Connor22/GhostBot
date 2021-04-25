function activate(schemaObject, botObject, discordObject, appObject, methodObject, commandObject, config, mongoose){
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

		schemaObject.discordServerSchemaConstructor.modules.usercustom = usercustomSchema;

		schemaObject.discordServerSchemaMethods = Object.assign({
			isRoleJoinable : function(roleID){
				return this.modules.usercustom.joinables.roles.includes(roleID);
			},
			isChannelShowable : function(channelID){
				return this.modules.usercustom.joinables.channels.cache.includes(channelID);
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

		}, schemaObject.discordServerSchemaMethods);

		botObject.on('guildMemberAdd', member => {
			try {
				onJoin(member);
			} catch (err) {console.log(err)}
		});

		async function addDefaultRole(member, server){
			if (server.modules.usercustom.default && server.modules.usercustom.default.length > 0) {
				for (var i = server.modules.usercustom.default.length - 1; i >= 0; i--) {
					member.roles.add(server.modules.usercustom.default[i]).catch(console.log);
				}
				// for (var role in server.modules.usercustom.default){
				// 	console.log(server.modules.usercustom.default[role]);
				// 	member.roles.add(server.modules.usercustom.default[role]).catch(console.log);
				// }
			}
		}

		async function onJoin(member){
			const server = await discordObject.Guild.findOne({_id: member.guild.id});

			if (!server){
				if(!server.modules.usercustom.enabled) console.log(`${server.name} does not have usercustom enabled.`);
				return;
			}

			addDefaultRole(member, server);
		}
}

exports.activate = activate;