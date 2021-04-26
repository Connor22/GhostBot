exports.active = {
	get: (id) => {},
	set: (id, state) => {}
};

exports.refresh = () => {

};

exports.prefix = {
	set: (serverID, prefix) => {},
	get: (serverID) => {}
};

exports.modules = {
	enable: (serverID, moduleName) => {},
	disable: (serverID, moduleName) => {},
	isEnabled: (serverID, moduleName) => {}
};

exports.attr = {
	get: (serverID, module, name ...parents) => {},
	set: (serverID, module, value, name, ...parents) => {}
};

exports.addChannel = (channelID) => {

};