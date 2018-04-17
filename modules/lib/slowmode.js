// Slowmode Server Module
	const slowmodeSchema = new mongoose.Schema({
		enabled : {type: Boolean, default: false},
		name : {type: String, default: "slowmode"}
	});

	slowmodeSchema.methods = {}