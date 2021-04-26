module.exports = (mongoose) => {
	discordChannelSchemaConstructor = {
		_id : {type: String, required: [true, "id must be set!"]},
		server: {type: String, required: [true, "server must be set!"]}, 
		modules: {}
	};

	discordChannelSchema = new mongoose.Schema(discordChannelSchemaConstructor, {minimize: false});

	discordChannelSchema.methods = {};

	return discordChannelSchema;
}