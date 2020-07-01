/* COMMAND OBJECTS */
	const usercustomizationModule = {
		"hide" : {
			description: "Hides the specified channel, removing the invokers ability to see it at all",
			use: "<prefix>hide [<channelName>|<channelMention>]",
			check: async function(message, channel, server){
				let channelName = message.split[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);

				if (!(message.guild.channels.exists("name", channelName))) return {name: "OtherError", message: `Cannot find channel \`${channelName}\``};

				return "Success";
			},
			exec: async function(message, channel, server){
				let channelName = message.split[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);

				message.guild.channels.find(val => val.name === channelName).overwritePermissions(message.author, {READ_MESSAGES: false});
			
				message.delete(5000);
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"show" : {
			description: "Shows the specified channel, enabling the invoker to see it",
			use: "<prefix>show [<channelName>|<channelMention>]",
			check: async function(message, channel, server){
				let channelName = message.split[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);
				
				if (!(message.guild.channels.exists("name", channelName))) return {name: "OtherError", message: `Cannot find channel \`${channelName}\``};
				if (!message.guild.channels.find(val => val.name === channelName).permissionOverwrites.has(message.author.id) 
					&& !(server.isChannelShowable(message.guild.channels.find(val => val.name === channelName).id))) return {name: "OtherError", message: `That channel doesn't seem to be joinable`};

				return "Success";
			},
			exec: async function(message, channel, server){
				let channelName = message.split[1];
				if (message.mentions.channels.size > 0) channelName = message.mentions.channels.first().name;
				if (channelName[0] === "#") channelName = channelName.substr(1);

				const showChannel = message.guild.channels.find(val => val.name === channelName)

				if (!(showChannel.permissionOverwrites.has(message.author.id))){
					showChannel.overwritePermissions(message.author, {READ_MESSAGES: true});
				} else {
					showChannel.overwritePermissions(message.author, {READ_MESSAGES: true});
				}

				message.delete(5000);
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"join" : {
			description: "Joins the specified role if it's joinable",
			use: "<prefix>join <role>",
			check: async function(message, channel, server){
				const role = message.guild.roles.find(role => role.name  === message.split[1]);
				if (!role){
					if (!server.modules.usercustom.superRoles[message.split[1].toLowerCase()]) return {name: "CommandError", message: "That role doesn't exist."};
				} else {
					if (!server.isRoleJoinable(role.id)) return {name: "OtherError", message: "That role is not joinable."};
				}
				
				if (!message.member) return {name: "OtherError", message: "You need to go online to use this command"};
				
				return "Success";
			},
			exec: async function(message, channel, server){
				const role = message.guild.roles.find(role => role.name  === message.split[1]);
				if (role) message.member.addRole(role.id);
				else {
					const subRoles = server.modules.usercustom.superRoles[message.split[1].toLowerCase()].subRoles;

					/*       Timer Solution       */
					for (var roleID in subRoles){
						var rID = roleID;
						setTimeout(function(rID){
							var id = rID;
							message.member.addRole(subRoles[id]).catch((err) => {
								setTimeout(function(id, subRoles){message.member.addRole(subRoles[id]).catch(console.log)}, 
									(Math.random() * 1000 + Math.random() * 1000 + 500), id, subRoles);;
							});
							
						}, (Math.random() * 1000 + Math.random() * 1000 + 500), rID);
					}
					/*                            */
				}
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"leave" : {
			description: "Leaves the specified role if it's joinable",
			use: "<prefix>leave <role>",
			check: async function(message, channel, server){
				const role = message.guild.roles.find(role => role.name  === message.split[1]);
				if (!role){
					if (!server.modules.usercustom.superRoles[message.split[1].toLowerCase()]) return {name: "CommandError", message: "That role doesn't exist."};
				} else {
					if (!server.isRoleJoinable(role.id)) return {name: "OtherError", message: "That role is not joinable."};
				}
				
				if (!message.member) return {name: "OtherError", message: "You need to go online to use this command"};

				return "Success";
			},
			exec: async function(message, channel, server){
				const role = message.guild.roles.find(role => role.name  === message.split[1]);
				if (role && message.member.roles.has(role.id)){
					console.log(`Leaving role`);
					message.member.removeRole(role.id);
				} else {
					// superRoleProcess(message, channel, server, role);
				}
				
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 0,
			possibleLengths: [2]
		},
		"makeshowable" : {
			description: "Makes the current channel able to be joined through the show command",
			use: "<prefix>makejoinable",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
				server.modules.usercustom.joinables.channels.addToSet(message.channel.id);
			},
			response: async function(message, channel, server){
				return;
			},
			defaultPermLevel: 3,
			possibleLengths: [1]
		},
		"joinablerole" : {
			description: "Makes the mentioned role joinable through the join command",
			use: "<prefix>ping",
			check: async function(message, channel, server){
				if (!message.mentions.roles.first()) return {name: "CommandError", message: "Please mention a role"};

				return "Success";
			},
			exec: async function(message, channel, server){
				server.defineJoinableRole(message.mentions.roles.first().id);

				return;
			},
			response: async function(message, channel, server){
				return `The role \<@&${message.mentions.roles.first().id}\> is now joinable `;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"addsubrole" : {
			description: "Adds a subrole to the first role",
			use: "=addsubrole <superrole> <subrole>",
			check: async function(message, channel, server){
				const subRole = message.guild.roles.find(role => role.name  === message.split[2].toLowerCase());
				if (!subRole) return {name: "CommandError", message: "That role doesn't exist."};

				return "Success";
			},
			exec: async function(message, channel, server){
				let superRole = message.split[1].toLowerCase();
				let superRoles = server.modules.usercustom.superRoles;
				const subRole = message.guild.roles.find(role => role.name  === message.split[2].toLowerCase());

				if (!superRoles) {
					server.modules.usercustom.superRoles = {};
					superRoles = server.modules.usercustom.superRoles;
				}

				if (!superRoles[superRole]) superRoles[superRole] = {subRoles: []};

				if (superRoles[superRole].subRoles.indexOf(subRole.id) === -1){
					superRoles[superRole].subRoles.push(subRole.id);
				}
			},
			response: async function(message, channel, server){
				let superRole = message.split[1].toLowerCase();
				return JSON.stringify(server.modules.usercustom.superRoles[superRole]);
			},
			defaultPermLevel: 3,
			possibleLengths: [3]
		},
		"deletesuperrole" : {
			description: "Deletes the super role",
			use: "=deletesuperrole <superrole>",
			check: async function(message, channel, server){
				let superRole = message.split[1].toLowerCase();
				if (!server.modules.usercustom.superRoles[superRole]) return {name: "CommandError", message: "That role doesn't exist."};

				return "Success";
			},
			exec: async function(message, channel, server){
				let superRole = message.split[1].toLowerCase();
				delete server.modules.usercustom.superRoles[superRole];
			},
			response: async function(message, channel, server){
				let superRole = message.split[1].toLowerCase();
				if (!server.modules.usercustom.superRoles[superRole]) return `The role has been deleted`
				else return "Failed"
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		},
		"defaultrole" : {
			description: "Defines the role that users will receive on join",
			use: "<prefix>defaultrole <role name>",
			check: async function(message, channel, server){
				let superRole = message.split[1].toLowerCase();

				if (!message.guild.roles.find(role => role.name  === message.split[1].toLowerCase()) &&
				 !server.modules.usercustom.superRoles[superRole]) return {name: "CommandError", message: "Please give a valid role"};

				return "Success";
			},
			exec: async function(message, channel, server){
				let role = await message.guild.roles.find(role => role.name  === message.split[1].toLowerCase());
				if (role){
					server.setDefaultRoles([role.id]);
				} else {
					server.setDefaultRoles(server.modules.usercustom.superRoles[message.split[1].toLowerCase()].subRoles);
				}

				return;
			},
			response: async function(message, channel, server){
				let roles = "";
				for (var role in server.modules.usercustom.default){
					if (roles != "") roles = `${roles}, \<@&${server.modules.usercustom.default[role]}\>`;
					else roles = `\<@&${server.modules.usercustom.default[role]}\>`;
				}
				return `The default roles are now ${roles}`;
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		}
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: async function(message, channel, server){
				return "Success";
			},
			exec: async function(message, channel, server){
			},
			response: async function(message, channel, server){
			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/

// function superRoleProcess(message, channel, server, role){
// 	for (let roleID in server.modules.usercustom.superRoles){
// 		if (message.member.roles.has(roleID) && (superRoles.subRoles.includes(role.id))){
// 			const superRole = server.modules.usercustom.superRoles[roleID];
// 			for (let index in superRoles.subRoles){
// 				if (superRoles.subRoles[index] != role.id){
// 					message.member.addRole(message.guild.roles.get(role.id));
// 				}
// 			}

// 			message.member.removeRole(message.guild.roles.get(roleID));
// 		}
// 	}
// }

module.exports = usercustomizationModule;