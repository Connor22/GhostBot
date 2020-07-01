// Starboard Server Module
const starboardSchema = new mongoose.Schema({
	enabled : {type: Boolean, default: false},
	categories : {},
	name : {type: String, default: "starboard"},
	starThreshold : {type: Number, default: 5},
	starEverything : {type: Boolean, default: false}
}, {minimize: false});

starboardSchema.methods = {
	createStarCategory: function(categoryID, pinChannel){
		if (!this.categories) this.categories = {};

		this.categories[categoryID] = {
			pinChannel: {
				id: pinChannel
			},
			messages: {}
		}
	}
};

GhostBot.discordServerSchemaConstructor.modules.starboard = starboardSchema;

GhostBot.discordServerSchemaMethods = Object.assign({
	
}, GhostBot.discordServerSchemaMethods);

GhostBot.on('messageReactionAdd', (reaction, user) => {
	try {reactionUpdate(reaction, user, 1)}
	catch (err) {console.log(err)}
});

GhostBot.on('messageReactionRemove', (reaction, user) => {
	try {reactionUpdate(reaction, user, -1)}
	catch (err) {console.log(err)}
});

GhostBot.on("message", message => {
	/* CHECKS */
		try{
			let timeout = 2000;
			if (message.content.includes('pixiv')) timeout = 7000;

			setTimeout(process, timeout, message);
		} catch (err) {
			console.log(err);
		}
});

async function process(message){
	try {
		const server = await GhostBot.Discord.Guild.findOne({_id: message.guild.id});
		
		if (!message.guild) return; //DMs shouldn't be handled
		if (!server) return;
		if (!(server.modules.starboard.enabled)) return;
		if (!server.modules.starboard.starEverything) return;
		if (!(server.modules.starboard.categories) || !(server.modules.starboard.categories[message.channel.parentID])) return;
		
		if (message.channel.name.startsWith('x')) return;
		
		if ((message.embeds.length === 0 || message.embeds.size === 0) && message.attachments.size === 0) return;
		

		console.log(`About to star ${message.id}`);

		message.react('⭐').catch(console.log);
	} catch (err) {console.log(err)}
}

/*GhostBot.Discord.maintenance = Object.assign({
	starboard: function(){
		GhostBot.Discord.Guild.find({} , (err, guilds) => {
	        if(err) console.log(err)

	        guilds.map(guild => {
	        	try{starboardMaintenance(guild);}
	        	catch (err) {console.log(err)}
	        })
	    });
	}
}, GhostBot.Discord.maintenance);*/

// async function starboardMaintenance(guild){
// 	const server = GhostBot.guilds.get(guild._id);
//     const starCategories = guild.modules.starboard.categories;
//     for (let starCategory in starCategories){
//     	for (let messageID in starCategories[starCategory].messages){
//     		let message = starCategories[starCategory].messages[messageID];

//     		if (Date.now() - (new Date(message.timestamp)) > 604800000) delete starCategories[starCategory].messages[message];

//     		if (message.channel && message.channel.id){
//     			let channel = server.channels.get(message.channel.id);
//     			channel.fetchMessage(messageID).catch(console.log);
//     		}
//     	}
//     }

//     guild.save();
// }

async function reactionUpdate(reaction, user, amount){
	if (user.bot) return;

	const message = reaction.message;
	const server = await GhostBot.Discord.Guild.findOne({_id: message.guild.id});

	if (reaction.emoji.name !== '⭐' || !server || !server.modules.starboard.enabled) {
		return;
	};

	if (amount === 1 && reactionCheck(message, reaction, user, server) != "Success") {
		user.send(reactionCheck(message, reaction, user, server));
		reaction.remove(user);
		return;
	}

	if (!server.modules.starboard.categories[message.channel.parentID]) 
	{
		console.log(`Could not find category for ${message.channel.parentID}`)
	}

	const starCategory = server.modules.starboard.categories[message.channel.parentID];
	const pinChannel = message.guild.channels.get(starCategory.pinChannel.id);

	let messageObject = fetchStarMessage(starCategory, message);

	messageObject.stars += amount;

	try{
		if (!messageObject.starboard.pinned && messageObject.stars >= server.modules.starboard.starThreshold){
			const embed = createEmbed(messageObject);
			const pinmessage = await pinChannel.send(message.image, embed);
			messageObject.starboard.pinned = true;
			messageObject.starboard.id = pinmessage.id;
		} else if (messageObject.starboard.pinned) {
			let pinMessage = await pinChannel.fetchMessage(messageObject.starboard.id);
			if (messageObject.stars < server.modules.starboard.starThreshold) {
				pinMessage.delete();
				messageObject.starboard.pinned = false;
			} else {
				const embed = createEmbed(messageObject);
				pinMessage.edit(message.image, embed);
			}
		}
	} catch (err) {
		console.log(err);
	}

	server.markModified(`modules.starboard`);
	server.save();
}

function fetchStarMessage(starCategory, message){
	let starMessage = starCategory.messages[message.id];

	if (!starMessage) {
		starCategory.messages[message.id] = {
			id: message.id,
			stars: 0,
			starboard: {
				id: "",
				pinned: false
			},
			content: message.content,
			author: {
				tag: message.author.tag,
				displayAvatarURL: message.author.displayAvatarURL
			},
			image: "",
			timestamp: message.createdTimestamp,
			channel: {
				name: message.channel.name,
				id: message.channel.id
			}
		};

		starMessage = starCategory.messages[message.id];

		if (message.embeds.length > 0){
			if (message.embeds[0].image) starMessage.image = message.embeds[0].image.url;
			else if (message.embeds[0].thumbnail) starMessage.image = message.embeds[0].thumbnail.url;
		} 
		if (message.attachments.array().length > 0){
			starMessage.image = message.attachments.array()[0].url; 
			if (starMessage.image.search(".mp4") > -1 || starMessage.image.search(".webm") > -1) starMessage.content += `\n${starMessage.image}`
		}
	}

	return starMessage;
}

function reactionCheck(message, reaction, user, server){
    if (message.author.id === user.id) return `${user}, you cannot star your own messages.`;
    if (!message.channel.parentID) return `${user}, that channel is not in a category.`;
    if (!(server.modules.starboard.categories[message.channel.parentID])) return `${user}, that channel does not have a specified starboard.`;
    if (message.channel.id === server.modules.starboard.categories[message.channel.parentID].pinChannel.id) return `${user}, you cannot star messages in the star board.`;
    return "Success";
}

function createEmbed(message){
	const embed = new Discord.RichEmbed()
    .setColor(15844367)
    .setDescription(message.content)
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setTimestamp(new Date(message.timestamp).toISOString())
    .setFooter(` ⭐ ${message.stars}  | ${message.id} | #${message.channel.name}`);

    if (message.image) embed.setImage(message.image);

    return embed;
}
