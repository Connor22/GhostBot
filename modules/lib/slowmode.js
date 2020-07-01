// Slowmode Server Module
	const slowmodeSchema = new mongoose.Schema({
		enabled : {type: Boolean, default: false},
		name : {type: String, default: "slowmode"}
	});

	slowmodeSchema.methods = {};

	GhostBot.discordChannelSchemaConstructor.modules.slowmode = {
		trackers: {
			global: [],
			roles: {}
		}
	};

	GhostBot.discordChannelSchemaMethods = Object.assign({
		addTracker : function(commandArray, server){
			const tracker = {
				type: commandArray[1],
			}

			switch (commandArray.length){
				case 3: 
					tracker.limit = 5;
					tracker.period = 20000;
					this.pushToTrackerArray(tracker);
					break;

				case 4:
					tracker.limit = 5;
					tracker.period = 20000;
					this.pushToTrackerArray(tracker, server.fetchRole(commandArray[3]));
					break;

				case 6:
					tracker.limit = commandArray[2];
					tracker.limit = GhostBot.parseTime(commandArray[3], commandArray[4]);
					this.pushToTrackerArray(tracker);
					break;

				case 7:
					tracker.limit = commandArray[2];
					tracker.limit = GhostBot.parseTime(commandArray[3], commandArray[4]);
					this.pushToTrackerArray(tracker, server.fetchRole(commandArray[6]));
					break;

				default:
					break;
			}
		},

		pushToTrackerArray : function(tracker, role){
			if (!role){
				this.modules.slowmode.trackers.global.push(tracker);
			} else {
				if (!this.modules.slowmode.trackers[role]){
					this.modules.slowmode.trackers[role] = [];
				}
				this.modules.slowmode.trackers[role].push(tracker);
			}
		}

	}, GhostBot.discordChannelSchemaMethods);