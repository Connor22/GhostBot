/* COMMAND OBJECTS */
	const levellingModule = {
		"enablexp" : {
			description: "Enables xp tracking in this channel",
			use: "<prefix>enablexp",
			check: function(message){
				return "Success";
			},
			exec: function(message){
				
			},
			defaultPermLevel: 3,
			possibleLengths: [2]
		}
	}

	/* Default Command

		"" : {
			description: "",
			use: "",
			check: function(message){
				return "Success";
			},
			exec: function(message){
			},
			defaultPermLevel: 0,
			possibleLengths: []
		}

	*/