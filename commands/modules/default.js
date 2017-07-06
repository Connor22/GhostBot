const defaultModule = {
	"ping" : {
		description: "Responds to ping",
		use: "<prefix>ping",
		check: function(message){
			return "Success";
		},
		exec: function(message){
			message.reply("pong");
		},
		defaultPermLevel: 1,
		possibleLengths: [1]
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

module.exports = defaultModule;