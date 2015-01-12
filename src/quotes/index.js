var commands = require('./commands'),
	schema_init = require('./schema');

module.exports = {
	displayname : 'Quotes',
	description : 'Remembers things people have said, and regurgitates them on command.',

	init : schema_init,

	commands : [{
			name : 'Remember',
			description : 'Remembers a users\' recent quote for later use. Partial quote and user name matches work - in case of multiples, most recent is used.',
			usage : 'remember [user] "partial quote"',
			trigger : /remember/i,
			func : commands.remember
		}, {
			name : 'Quote',
			description : 'Quotes a user, optionally with a specific quote. Results in a single quote. If both user and quote are omitted, a random quote is returned.',
			usage : 'quote [user] ["partial quote"]',
			trigger : /quote/i,
			func : commands.quote
		}, {
			name : 'Quotemash',
			description : 'Remembers a random pile of quotes about a user or word(s). If user is omitted, random users are selected for extra fun.',
			usage : 'quotemash [user] [word(s)]',
			trigger : /quotemash/i,
			func : commands.quotemash
		}
	]
};