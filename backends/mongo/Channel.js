exports.get = function(message, server){
	let channel = await db.discord.Channel.findOne({_id: message.channel.id});
	// Handle first-time channel access
		if (!channel){
			channel = new db.discord.Channel({_id: message.channel.id, name: message.channel.name, server: message.channel.parentID})
			backend.Server.addChannel(server, message.channel.id);
		}
}