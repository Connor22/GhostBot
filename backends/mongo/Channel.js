exports.active = {
	get: (id) => {},
	set: (id, state) => {}
};

exports.attr = {
	get: (channelID, module, name ...parents) => {},
	set: (channelID, module, value, name, ...parents) => {}
};