function activate(schemaObject, botObject, discordObject, appObject, methodObject, commandObject, config, mongoose){
	schemaObject.discordChannelSchema.postVoting = {type: Boolean, default: false};

	methodObject.preCheck = Object.assign({
		postVotingCheck : function(message){
			if (botObject.fetchChannel(message).postVoting) {
				message.react("⬆").then(setTimeout(function(){message.react("⬇").catch(console.log)},2000)).catch(console.log);
			}
		}
	}, methodObject.preCheck);
}

exports.activate = activate;