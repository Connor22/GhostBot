/* DICTIONARIES */
	const debugCommands = {
		"channels" : function(message){
			printChannels(message);
		}
	};

/* FUNCTIONS */

function printChannels(message){
	console.log(allChannels);
}
	

module.exports = debugCommands;