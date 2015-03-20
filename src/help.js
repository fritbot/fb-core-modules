var helpTopics = {};

function addModule (module) {
	var entry = {
		name : module.displayname,
		description : module.description,
		commands : []
	};

	if (module.commands) {
		var command;
		for (var i = 0; i < module.commands.length; i++) {
			command = module.commands[i];
			entry.commands.push({
				name : command.name,
				description : command.description,
				usage : command.usage
			});
		}
	}

	helpTopics[module.displayname] = entry;
}

function initHelp(bot, modules) {
	// Add all previously loaded modules
	for (var i = 0; i < modules.loaded.length; i++) {
		addModule(modules.loaded[i]);
	}

	// Add all future modules
	bot.events.on('moduleLoaded', addModule);
}

function displayHelp (route) {
	var out = ['Available commands:'];
	var module;
	var command;

	for (var module_name in helpTopics) {
		module = helpTopics[module_name];
		for (var i = 0; i < module.commands.length; i++) {
			command = module.commands[i];
			out.push('(' + module_name + ') ' + command.name + ' - ' + command.usage);
		}
	}

	route.direct().send(out.join('\n'));
}

module.exports = {
	displayname : 'Help',
	description : 'Online chat manual',

	init : initHelp,

	commands : [{
		name : 'Show Commands',
		description : 'Show all available commands',
		usage : 'help [topic]',
		trigger : /help/i,
		func : displayHelp,
		core : true
	}]
};