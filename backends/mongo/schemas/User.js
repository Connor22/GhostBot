module.exports = (mongoose) => {
	discordUserSchemaConstructor = {
		_id : {type: String, required: [true, "id must be set!"]},
		servers: {}
	};

	discordUserSchema = new mongoose.Schema(discordUserSchemaConstructor, {minimize: false});

	discordUserSchema.methods = {
		// Attribute manipulation
			addAttr: () => {

			},

			get: () => {

			}, 

			set: () => {

			},
	};
}