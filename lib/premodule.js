const mongoose = require('mongoose');
// Server
	/* Base Server Module Schema
		const defaultSchema = mongoose.Schema({
			enabled : {type: Boolean, default: false},
			name : {type: String, default: "default"}
		});

		defaultSchema.methods = {
			enable : function(){
				this.enabled = true;
			},
			disable : function(){
				this.enabled = false;
			}
		} */

	// Server
		GhostBot.serverSchemaConstructor = {
			_id : {type: String, required: [true, "ID must be set!"]},
			name : {type: String}, 
			prefix : {type: String, default: "="},
			channels: [{ type: String, ref: 'Channels' }],
			isInitialized: {type: Boolean, default: false},
			modules: {},
		};

		GhostBot.serverSchemaMethods = {}

// Channel
	// Channel
		GhostBot.channelSchemaConstructor = {
			_id : {type: String, required: [true, "id must be set!"]},
			server: {type: String, required: [true, "server must be set!"]}, 
			modules: {}
		};

		GhostBot.channelSchemaMethods = {}

// User
	// User
		GhostBot.userSchemaConstructor = {
			_id : {type: String, required: [true, "id must be set!"]},
			server: {type: String, required: [true, "server must be set!"]},
			modules: {},
		};

		GhostBot.userSchemaMethods = {}