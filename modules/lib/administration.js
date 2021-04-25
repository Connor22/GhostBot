exports.activate = function(backend){
	backend.Server.attr.add("administration", "logChannel", "string");

	backend.Server.attr.add("administration", "roles", "category");

	for (role of ["admin", "mod", "jmod", "softban"]){
		backend.Server.attr.add("administration", role, "category", "roles");
		backend.Server.attr.add("administration", "name", "string", "roles", role);
		backend.Server.attr.add("administration", "id", "string", "roles", role);
	}

	backend.ServerUser.attr.add("administration", "banned", "boolean");

	backend.isUserBanned = (server, userID) => {
		return this.ServerUser.attr.get(server, "administration", userID, "banned");
	};
}

// Triggers
	exports.addTriggers = function(bot){
		bot.on('guildMemberAdd', member => {
			try {
				onJoin(member);
			} catch (err) {
				console.log(err)
			}
		});
	}

	async function onJoin(member){
		const server = await backend.getServer(member.guild.id);
			
		if (!server && process.env.DEBUG){
			console.log("Could not find server");
			return;
		}

		reban(member, server);
	}

	

// Bans
	exports.reban = async function(backend, server, member){
		if (backend.isUserBanned(server, member.id)) 
			member.roles.add(backend.Server.attr.get("administration", "roles", "softban", "id");
	}

// Permissions
	exports.permissionLevelChecker = function(backend, message){
		if (!message.member) return 0;

		if (message.member.id === config.ids.dev){
			return 4;
		} else if (message.member.hasPermission('ADMINISTRATOR') || 
			message.member.roles.has(backend.Server.attr.get("administration", "id", "roles", "admin")))
		{
			return 3;
		} else if (message.member.roles.has(backend.Server.attr.get("administration", "id", "roles", "mod"))){
			return 2;
		} else  if (message.member.roles.has(backend.Server.attr.get("administration", "id", "roles", "jmod"))){
			return 1;
		} else {
			return 0;
		}
	};

// Commands
	exports.checkCommand = function(commandObject, message){
		for (let module in commandObject){
			if (command in commandObject[module]){
				//if (!backend.Server.attr.get(module].enabled) return {name: "CommandError", message: "That module is disabled"};				
				return commandObject[module][command];
			}
		}

		return {name: "CommandNotFoundError"};
	};

// Maintenance
	exports.maintenance = {
		//(backend, server, user) => {
		//  // Reban users who lost the role for any reason
		//	server.users.cache.forEach(function(user){
		//		exports.reban(backend, server, user);
		//});
	}