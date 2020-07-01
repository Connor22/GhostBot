GhostBot.discordChannelSchema.postVoting = {type: Boolean, default: false};

GhostBot.preCheck = Object.assign({
	postVotingCheck : function(message){
		if (GhostBot.fetchChannel(message).postVoting) {
			message.react("⬆").then(setTimeout(function(){message.react("⬇").catch(console.log)},2000)).catch(console.log);
		}
	}
}, GhostBot.preCheck);