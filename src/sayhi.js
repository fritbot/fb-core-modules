module.exports = {
	'displayname': "Hello World",
	'description': "Says hi, useful test/demo functions, not much else",

	init: function (bot) {
		// Respond to all names!
		this.listeners[0].trigger = new RegExp(bot.config.responds_to.map( function (name) {
			return '(?:(?:(?:hello)|(?:hi)) ' + name + ')';
		}).join('|'), 'i');
	},

	commands: [{
			'name': 'Say Hi',
			'description': "Says hi to someone.",
			'usage': 'say hi [[to] person]',
			'trigger': /say ((hi)|(hello))( to)?/i,
			'func': function (route, args) {
				if (args.length) {
					route.indirect().send("Hello, " + args.join(' ') + "!");
				} else {
					route.send("Hi there!");
				}
			}
		}
	],

	// For the record, this listener could more or less be accomplished by a Fact, but I wanted to test out init + listeners during development.
	listeners: [{
			'name': 'Be Polite',
			'description': "What a nice bot.",
			'trigger': null, // Not a normal use case, but an interesting one: The triggers are set up during the init.
			'func': function (route, args) {
				route.send("Hi there!");
				return true;
			}
		}
	]
}