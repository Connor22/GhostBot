function activate(schemaObject, botObject, discordObject, appObject, methodObject, commandObject, config, mongoose){
	// Archive Server Module
	var Mongoose = require('mongoose/lib').Mongoose;

		const Archive = {};

	// Archive
		const messageSchema = new mongoose.Schema({
			_id : {type: String, required: [true, "id must be set!"]},
			attachments: [String],
			authorID: {type: String, required: [true, "authorID must be set!"]},
			channelID: {type: String, required: [true, "channelID must be set!"]},
			cleanContent: String,
			content: String,
			createdAt: {type: Number, required: [true, "createdAt must be set!"]},
			editedAt: Number,
			guildID: {type: String, required: [true, "guildID must be set!"]},
			pinned: {type: Boolean, required: [true, "pinned must be set!"]},
			mentions: [String]
		})

		const channelSchema = new mongoose.Schema({
			_id: String,
			messages: [messageSchema],
			messageAmount: {type: Number, default: 0},
			lastMessage: {type: String, default: ""},
			totalAmount: {type: Number, default: 0},
			limit: {type: Number, default: 0},
		})

		channelSchema.methods = {
			lastMessageArchived : function(id){
				if (!id) return this.lastMessage;
				else this.lastMessage = id;
			}
		}

		Archive.Channel = function(){
			return new Mongoose().createConnection('mongodb://localhost/archive').model('Channel', channelSchema);
		} 

	// Aliases

	// Discord
		const channelArchiveSchema = new mongoose.Schema({
			name : {type: String, default: "archive"},
			lastMessageArchived: {type: String, default: ""}
		})

		const serverArchiveSchema = new mongoose.Schema({
			enabled : {type: Boolean, default: false},
			name : {type: String, default: "archive"}
		}, {minimize: false});

		GhostBot.discordChannelSchemaMethods = Object.assign({
			archive : function(message, messageID){
				const channelModel = Archive.Channel();
				channelModel.findOne({_id: message.channel.id}).then((storageChannel) => {
					if (!storageChannel) {
						storageChannel = new channelModel({_id: message.channel.id});
					}
					if (!messageID) messageID = storageChannel.lastMessageArchived();
					addMessage(message, storageChannel);
					storageChannel.messageAmount += 1;
					storageChannel.save();
				}).then(() => {
					archive100next(messageID, message.channel.id);
				});
			}
		}, GhostBot.discordChannelSchemaMethods);

		GhostBot.discordServerSchemaMethods = Object.assign({
			enable : function() {
				this.modules.archival.enabled = true;
			}
		}, GhostBot.discordServerSchemaMethods)

		GhostBot.discordServerSchemaConstructor.modules.archival = serverArchiveSchema;
		GhostBot.discordChannelSchemaConstructor.modules.archival = channelArchiveSchema;



	// Functions
	async function archive100next(messageID, channelID){
		console.log("archive100next");
		const channel = await GhostBot.channels.cache.get(channelID);
		channel.messages.fetch({after: messageID, limit: 100}).then(messages => {
			archive100(messages, channelID).then((size) => {
				console.log("archive100next.then");
				archiveCheck(size, channelID).catch(console.log);
			}).catch(console.log);
		}).catch(console.log);
	}

	async function archive100(messages, channelID){
		console.log("archive100");

		const size = messages.size;
		const channelModel = Archive.Channel();
		const storageChannel = await channelModel.findOne({_id: channelID}).catch(console.log);

		messages.forEach(function(message, index, collection){
			if (message.type === "DEFAULT"){
				addMessage(message, storageChannel);
				if (storageChannel.lastMessageArchived() < message.id) storageChannel.lastMessageArchived(message.id);
				storageChannel.totalAmount += 1;
				storageChannel.limit += 1;
			}
		});
		await storageChannel.save().catch(console.log);
		return size;
	}

	async function archiveCheck(size, channelID){
		console.log("archiveCheck");
		const channelModel = Archive.Channel();
		const storageChannel = await channelModel.findOne({_id: channelID}).catch(console.log);
		if (storageChannel.limit > 5000 && size === 100) {
			storageChannel.limit = 0;
			console.log("Done 5000, waiting 5s before recommencing");
			setTimeout(archive100next, 5000, storageChannel.lastMessageArchived(), channelID, storageChannel);
		} else if (size === 100){
			console.log(`Done ${storageChannel.totalAmount}`);
			setTimeout(archive100next, 500, storageChannel.lastMessageArchived(), channelID, storageChannel);
		} else if (storageChannel.totalAmount > 9999 || size != 100){
			console.log(`Messages Length: ${storageChannel.messages.length}\nTotalAmount: ${storageChannel.totalAmount}\nMessageAmount: ${storageChannel.messageAmount}`);
			if (storageChannel.messages.length != storageChannel.totalAmount + storageChannel.messageAmount &&
				storageChannel.messages.length != storageChannel.totalAmount + storageChannel.messageAmount + 1 &&
				storageChannel.messages.length != storageChannel.totalAmount + storageChannel.messageAmount - 1){
				console.log("archiveCheck Timeout");
				setTimeout(archiveCheck, 1000, size, channelID);
			} else {
				archiveAnnounce(channelID, storageChannel, size);
			}
		} else {
			console.log("default");
		}
	}

	function archiveAnnounce(channelID, storageChannel, size){
		console.log("Done this session");
		console.log(`Archived ${storageChannel.totalAmount}`);
		console.log(`Messages in archive: ${storageChannel.messages.length}`)
		storageChannel.messageAmount = storageChannel.messages.length;
		if (size != 100) {
			const channel = GhostBot.channels.cache.get(channelID);
			channel.send(`Messages in archive: ${storageChannel.messages.length}`);
			channel.send(`Completed archive`);
			
		}
		storageChannel.totalAmount = 0;
		storageChannel.limit = 0;
		storageChannel.save();
	}

	function addMessage(message, storageChannel){
		const messageConstructor = {
			_id: message.id,
			authorID: message.author.id,
			channelID: message.channel.id,
			cleanContent: message.cleanContent,
			content: message.content,
			createdAt: message.createdTimestamp,
			guildID: message.guild.id,
			pinned: message.pinned
		};

		if (message.editedTimestamp) messageConstructor.editedAt = message.editedTimestamp;
		
		if (message.attachments.size > 0){
			messageConstructor.attachments = [];
			message.attachments.forEach(function(attachment, id, collection){
				messageConstructor.attachments.push(attachment.url);
			});
		}

		if (message.mentions.members.size > 0){
			messageConstructor.mentions = [];
			message.mentions.members.forEach(function(member, id, collection){
				messageConstructor.mentions.push(member.id);
			});
		}

		storageChannel.messages.addToSet(messageConstructor);
	}
}

exports.activate = activate;