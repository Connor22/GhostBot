/* COMMAND OBJECTS */
	const rulesModule = {
		"rules" : {
			description: "Sends the invoker the rules for the channel. Requires the invoker to have DMs enabled.",
			use: "<prefix>rules",
			aliases: ["channelrules"],
			check: function(message){
				if (!fetchChannel(message).static.modules.rules || fetchChannel(message).static.modules.rules === {}) return {name: "OtherError", message: `Channel rules have not been defined for ${message.channel.name}`}

				return "Success";
			},
			exec: function(message){
				const rulesEmbed = new Discord.RichEmbed();
				rulesEmbed.setAuthor(`#${message.channel.name} Rules`, "http://i.imgur.com/sIcMXQ2.png");
				rulesEmbed.setDescription(fetchServer(message).static.modules.rules.disclaimer);
				rulesEmbed.setTitle("Please Note:");
				for (var section in fetchChannel(message).static.modules.rules.sections){
					rulesEmbed.addField(fetchChannel(message).static.modules.rules.sections[section].name, fetchChannel(message).static.modules.rules.sections[section].content);
				}
				rulesEmbed.setFooter(`From the ${message.guild.name} server`);
				rulesEmbed.setColor(51455);

				message.author.sendMessage('Please enable embeds to view the channel rules.', {embed: rulesEmbed});
			
				message.delete(2000);
			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		},
		"serverrules" : {
			description: "Sends the invoker the rules for the server. Requires the invoker to have DMs enabled.",
			use: "<prefix>serverrules",
			aliases: ["globalrules"],
			check: function(message){
				if (!fetchServer(message).static.modules.rules || fetchServer(message).static.modules.rules.sections === []) return {name: "OtherError", message: `Server rules have not been defined for ${message.guild.name}`}

				return "Success";
			},
			exec: function(message){
				const rulesEmbed = new Discord.RichEmbed();
				rulesEmbed.setAuthor(`${message.guild.name} Rules`, "http://i.imgur.com/sIcMXQ2.png");
				rulesEmbed.setDescription(fetchServer(message).static.modules.rules.disclaimer);
				rulesEmbed.setTitle("Please Note:");
				for (var section in fetchServer(message).static.modules.rules.sections){
					rulesEmbed.addField(fetchServer(message).static.modules.rules.sections[section].name, fetchServer(message).static.modules.rules.sections[section].content);
				}
				rulesEmbed.setColor(25725);

				message.author.sendMessage('Please enable embeds to view the server rules.', {embed: rulesEmbed});

				message.delete(2000);
			},
			defaultPermLevel: 0,
			possibleLengths: [1]
		}
	}

	rulesModule.globalrules = rulesModule.serverrules;

/* Default Command

	"" : {
		description: "",
		use: "",
		check: function(message){
			return "Success";
		},
		exec: function(message){
		},
		defaultPermLevel: 0,
		possibleLengths: []
	}

*/

module.exports = rulesModule;