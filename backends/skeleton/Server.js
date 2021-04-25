exports.check = (id) => {

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
	add: (module, name, type, ...parents) => {},
	get: (serverID, module, name ...parents) => {},
	set: (serverID, module, value, name, ...parents) => {}
};

exports.addChannel = () => {

};