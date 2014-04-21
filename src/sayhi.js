module.exports = {
	'displayname': "Hello World",
	'description': "Says hi, useful test function, not much else",

	commands: [{
			'name': 'Say Hi, optionall to a person',
			'usage': 'say hi [[to] person]',
			'trigger': /say ((hi)|(hello))( to)?/i,
			'func': function (route, args) {
				if (args.length) {
					route.user = null; // Drop user so we don't direct the message at them
					this.bot.send(route, "Hello, " + args.join(' ') + "!");
				} else {
					this.bot.send(route, "Hi there!");
				}
			}
		}
	]
}