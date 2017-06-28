	// DOES THE WHOLE MESSAGE MATCH A GIVEN COMMAND AND ITS POTENTIAL ARGUMENTS
	function matchCommandTypes(splitCommands, command, argumentTypes){ //Parent function : modCommands
		var isMatch = true;

		if(splitCommands[0] != command){
			isMatch = false;
		} 

		Object.keys(argumentTypes).forEach(function(type) {
			if(argumentTypes[type] === "number" && isNaN(splitCommands[type])){
				isMatch = false;
			}
	        if(argumentTypes[type] === "string" && !(isNaN(splitCommands[type]))){
	        	isMatch = false;
	        }
		});

		if(!(Object.keys(argumentTypes).length === (splitCommands.length - 1))){isMatch = false;}

		return isMatch;
	}

	// IS USER A ROLE?
	function roleCheck(roleObject, roleArray){ //Parent function : checkCommands
		var isRole = false;
		for (var index = 0; index < roleObject.length; ++index){
			if(checkArray(roleObject[index].name, roleArray)){
				isRole = true;
			}
		}
		return isRole;
	}

	// IS USER A MOD OR A DEVELOPER?
	function priorityCheck(message, powerRoles, type){
		return (roleCheck(message.channel.server.rolesOfUser(message.author), powerRoles[type]));
	}

	// SHOULD USER BE LIMITED?
	function isLimitedUser(message, powerRoles){
		var isLim = true;
		if (priorityCheck(message, powerRoles, "mod") || priorityCheck(message, powerRoles, "admin") || priorityCheck(message, powerRoles, "jmod")){
			isLim = false;
		}
		if (message.channel.id === "158870396685254656" && roleCheck(message.channel.server.rolesOfUser(message.author), powerRoles.priviledgedRoles)){
			isLim = false;
		}
		return isLim;
	}

	// IS ITEM IN ARRAY?
	function checkArray(item, array){ //Parent function : modCheck
		return (array.indexOf(item) != -1);
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

global.matchCommandTypes = matchCommandTypes;
global.isLimitedUser = isLimitedUser;
global.priorityCheck = priorityCheck;
global.checkArray = checkArray;
global.makeReadable = makeReadable;
global.parseTime = parseTime;	