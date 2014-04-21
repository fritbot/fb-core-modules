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
					route.user = null; // Drop user so we don't direct the message at them
					this.send(route, "Hello, " + args.join(' ') + "!");
				} else {
					this.send(route, "Hi there!");
				}
			}
		}
	],

	listeners: [{
			'name': 'Be Polite',
			'description': "What a nice bot.",
			'trigger': null,
			'func': function (route, args) {
				this.send(route, "Hi there!");
				return true;
			}
		}
	]
}