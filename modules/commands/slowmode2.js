/* COMMAND OBJECTS */
	const slowmodeModule = {
		"addtracker" : {
			description: "Creates a tracker for this channel.",
			use: "<prefix>addtracker [all|image|text] {<number> <number> [seconds|minutes|hours]} [role|global] {[roleID|roleName]}",
			check: async function(message, channel, server){
				
				if (["all", "image", "text"].contains(message.split[1])) return {name: "CommandError", message: "You can only add \`all\`, \`image\`, or \`text\` trackers."};

				switch (commandArray.length){
					case 3: 
						if (message.split[2] != "global") return {name: "CommandError", message: "Please specify whether this tracker applies globally or to a specific role."};
						break;

					case 4:
						if (message.split[2] != "role") return {name: "CommandError", message: "Please specify whether this tracker applies globally or to a specific role."};
						if (!server.hasRole(message.split[3])) return {name: "CommandError", message: "Please specify a valid role."};
						break;

					case 6:
						if (["second", "seconds", "minute", "minutes", "hour", "hours"].contains(message.split[4])) return {name: "CommandError", message: "5th word must be a valid unit of time."};
						if (message.split[5] != "global") return {name: "CommandError", message: "Please specify whether this tracker applies globally or to a specific role."};
						break;

					case 7:
						if (["second", "seconds", "minute", "minutes", "hour", "hours"].contains(message.split[4])) return {name: "CommandError", message: "5th word must be a valid unit of time."};
						if (message.split[5] != "role") return {name: "CommandError", message: "Please specify whether this tracker applies globally or to a specific role."};
						if (!server.hasRole(message.split[6])) return {name: "CommandError", message: "Please specify a valid role."};
						break;

					default:
						return {name: "OtherError", message: "Bad checking for length. Please ping dev."};
						break;
				}

				return "Success";
			},
			exec: async function(message, channel, server){
				

				channel.addTracker(splitCommand);

				return;
			},
			response: async function(message, channel, server){
				return "Tracker successfully created.";
			},
			defaultPermLevel: 3,
			possibleLengths: [3, 4, 6, 7]
		},
		"displaytracker" : {
			description: "Either displays a list of trackers currently active on this channel, or describes the tracker if given a number",
			use: "<prefix>displaytracker [global|role] {[roleID|roleName]} {<number>}",
			check: async function(message, channel, server){
				
				if (splitCommand.length){
					if (Number.isNaN(message.split[splitCommand.length - 1])) return {name: "CommandError", message: "Last argument must be a number"}; 
					if (!channel.fetchTrackers(splitCommand)) return {name: "CommandError", message: "That "}; 
				}

				if (["global", "role"].contains(message.split[1])) return {name: "CommandError", message: "Please specify whether you want trackers that apply globally or to a specific role."};
				
				if (message.split[1] === "role"){
					if (!server.hasRole(message.split[2])) {name: "CommandError", message: "That role doesn't exist."};
					if (!channel.hasRole(server.hasRole(message.split[2]))) {name: "OtherError", message: "That role doesn't have any associated trackers."};
				}

				return "Success";
			},
			exec: async function(message, channel, server){
				return;
			},
			response: async function(message, channel, server){
				return "Pong";
			},
			defaultPermLevel: 3,
			aliases: ["displaytrackers, displaylimits, "],
			possibleLengths: [2, 3, 4]
		},