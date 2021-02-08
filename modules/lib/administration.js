exports.activate = function(backend){
	backend.addServerAttribute("administration", "logChannel", "string");

	backend.addServerAttribute("administration", "roles", "category");

	for (role of ["admin", "mod", "jmod", "softban"]){
		backend.addServerSubAttr("administration", role, "category", "roles");
		backend.addServerSubAttr("administration", "name", "string", "roles", role);
		backend.addServerSubAttr("administration", "id", "string", "roles", role);
	}

	backend.addServerUserAttribute("administration", "banned", "boolean", false);

	backend.isUserBanned = function(){
		return backend.getUserAttr(server, userID, "banned");
	}
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
			
		if (!server && debug){
			console.log("Could not find server");
			return;
		}

		reban(member, server);
	}

	

// Bans
	exports.reban = async function(backend, server, member){
		if (backend.isUserBanned(server, member.id)) member.roles.add(server.modules.administration.roles.softban.id);
	}

// Permissions
	exports.permissionLevelChecker = function(server, member){
		if (!member) return 0;

		if (member.id === config.ids.dev){
			return 4;
		} else if (member.roles.has(server.modules.administration.roles.admin.id) || member.hasPermission('ADMINISTRATOR')){
			return 3;
		} else if (member.roles.has(server.modules.administration.roles.mod.id)){
			return 2;
		} else  if (member.roles.has(server.modules.administration.roles.jmod.id)) {
			return 1;
		} else {
			return 0;
		}
	};

// Commands
	exports.checkCommand = function(command, message){
		for (let module in commandObject){
			if (command in commandObject[module]){
				//if (!server.modules[module].enabled) return {name: "CommandError", message: "That module is disabled"};				
				return commandObject[module][command];
			}
		}

		return {name: "CommandNotFoundError"};
	};

// Maintenance
	exports.maintenance = {
		(backend, server, user) => {
		// Reban users who lost the role for any reason
			server.users.cache.forEach(function(user){
				exports.reban(backend, server, user);
			});
	}