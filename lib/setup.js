/* FUNCTIONS */
	function setupBot(message){
		const server = {
			name: message.guild.name,
			prefix: "=",
			channels: {},
			id: message.guild.id,
			setupID: message.author.id,
			roles: {
				admin: {
					name: '', 
					id: '',
				},
				mod: {
					name: '', 
					id: '',
				},
				jmod: {
					name: '', 
					id: '',
				},
			},
			bannedUsers: [],
			joinableRoles: [],
			logChannel: '',
			rules: {},
		}

		message.reply(`Thank you for adding ${config.strings.botName} to ${server.name}! The first thing I need to know is what prefix you'd like to use for my commands.`);
		
		step1_prefix(message, server);
	}

	function step1_prefix(message, server){
		const authorFilter = (response) => {
 			if (!response.author.bot) console.log(`Author ID: ${response.author.id} \n Message: ${response.content}`);
 			return response.author.id === server.setupID;
 		}

 		message.channel.awaitMessages(authorFilter, {
		    max: 1,
		    time: 30000,
		    errors: ['time'],
		  })
		  .then((collected) => {
		    step1_verification(message, server);
		  })
		  .then(console.log(`Success`))
		  .catch(console.log);
	}

	function step1_verification(message, server){
		message.reply(`My new prefix is \`${server.prefix}\`. Is this correct?`);

		function filterYesNo(m){
 			let msg = m.cleanContent.toLowerCase(); 
 			return (m.author.id === server.setupID && (msg === "yes" || msg === "no"));
 		}

 		message.channel.awaitMessages(filterYesNo, {maxMatches: 1, time: 30000, errors:['time']})
 			.then((collected) => {
 				if (collected.first().cleanContent.toLowerCase() === "no"){
 					step1_prefix(message, server);
 					return;
 				} 				
 			})
 			.then(() => {
 				message.reply(`Okay, my new prefix is \`${server.prefix}\``);
 				step_final(message, server);
 			})
 			.catch(console.log);		
	}

	function step_final(message, server){
		serverStore[message.guild.id] = server;
		setTimeout(function(){message.reply(`Setup is over! Enjoy ${config.strings.botName}`);}, 1000);
	}

/* HELPER FUNCTION */
	function timeError(message) {
		message.reply(`I'm sorry, I didn't hear from you within 30 seconds. Please start the setup again.`);
		delete serverStore[message.guild.id];
	}

exports.setupBot = setupBot;