/* PREFIX */
	exports.Prefix.set = function(server, prefix){

	}

/* MODULE */
	exports.Module.isEnabled = function(){

	}

	exports.Module.enable = function(){

	}

	exports.Module.disable = function(){

	}

/* GETTERSETTER */
	exports.get = async function(id, verb){
		let server = db.discord.Guild.findOne({_id: message.guild.id});

		// Handle first-time server access
			if (!server && verb){
				if (debug) console.log("Constructing Server");
				server = await constructServer(message);
				server.save(function (err, server) {   
			  		if (err) return console.log(err);    
				});
			}

		// Useful shortcut
			if (!server.isInitialized && !verb === "initialize") return;
	}

	async function constructServer(message){
		const serverConstructor = {
			_id: message.guild.id, 
			name: message.guild.name,
			modules: {}
		};

		for (let module in commands){
			serverConstructor.modules[module] = {}
		};

		return new db.discord.Guild(serverConstructor);
	}

/* CHANNEL MANIP */
	exports.addChannel(){

	}

/* SERVER MANIP */
	exports.refresh = function(){
		const serverObj = server.toObject();
		await discordObject.Guild.findByIdAndRemove(message.guild.id);
		
		for (let module in GhostBot.modules.lib){
			if (!serverObj.modules[module]) serverObj.modules[module] = {};
		};

		await discordObject.Guild.create(serverObj);
	}