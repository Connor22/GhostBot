/* FUNCTIONS */
	function splitCommand(message, prefixLength){
		return message.content.substr(prefixLength).split(" ");
	}

	function stripCommand(message, prefixLength) {
		return message.content.substr(prefixLength + splitCommand(message, prefixLength)[0].length + 1);
	}

	function getTimeRemaining(tracker, id){
		if (!tracker || !tracker.container) throw {name: "OtherError", message: "Tracker misinitialized"};
		let period = tracker[tracker.container][id].period;
		if (!tracker[tracker.container][id].period) period = tracker.period;
		
		return period - (Date.now() - tracker[tracker.container][id].timeStamp);
	}

	function parseTime(number, format) {
		switch (format) {
		    case "minutes":
		    case "minute":
		        return number * 60000;
		        break;
		    case "seconds":
		    case "second":
		        return number * 1000;
		        break;
		    case "hours":
		    case "hour":
		        return number * 3600000;
		        break;
		    default:
		    	throw "invalid input";
		}
	}

	function makeReadable(milliseconds){
		if (milliseconds > 3600000){
			return (Math.floor(milliseconds/3600000) + " hours");
		} else if (milliseconds > 60000){
			return (Math.floor(milliseconds/60000) + " minutes");
		} else {
			return (Math.floor(milliseconds/1000) + " seconds");
		} 
	}

	function capitalizeFirstLetter(string) {
	    return string[0].toUpperCase() + string.slice(1);
	}

	exports.getTimeRemaining = getTimeRemaining;
	exports.splitCommand = splitCommand;
	exports.stripCommand = stripCommand;
	exports.makeReadable = makeReadable;
	exports.parseTime = parseTime;	
	exports.capitalizeFirstLetter = capitalizeFirstLetter;