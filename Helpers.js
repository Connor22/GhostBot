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
	function modCheck(message, powerRoles){
		return (roleCheck(message.channel.server.rolesOfUser(message.author), powerRoles.modArray) 
					|| checkArray(message.author.id, powerRoles.primeUserArray));
	}

	// SHOULD USER BE LIMITED?
	function isLimitedUser(message, powerRoles){
		return !(roleCheck(message.channel.server.rolesOfUser(message.author), powerRoles.modArray)
			|| roleCheck(message.channel.server.rolesOfUser(message.author), powerRoles.priviledgedRoles)
			|| checkArray(message.author.id, powerRoles.primeUserArray));
	}

	// IS ITEM IN ARRAY?
	function checkArray(item, array){ //Parent function : modCheck
		return (array.indexOf(item) != -1);
	}

exports.matchCommandTypes = matchCommandTypes;
exports.isLimitedUser = isLimitedUser;
exports.modCheck = modCheck;
exports.checkArray = checkArray;