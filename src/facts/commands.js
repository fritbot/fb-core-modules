var _ = require('lodash');

var last_info = [];

module.exports = {
	learn : function (route, args) {
		var trigger = args.shift();
		var alias = false;
		var rex_trigger;

		if (trigger === 'alias') {
			alias = true;
			trigger = args.shift();
		}

		// Reject short triggers, add word boundaries to non-regex triggers.
		if (trigger[0] === '/') {
			if (trigger.length < 6) {
				route.send('Triggers must be longer than that!');
				return;
			}

			rex_trigger = trigger.replace(/\//g, '');
		} else {
			if (trigger.length < 4) {
				route.send('Triggers must be longer than that!');
				return;
			}
			rex_trigger =  '\\b' + trigger + '\\b';
		}

		// Write the alias or trigger.
		var remainder = args.join(' ');
		var promise;
		if (alias) {
			promise = this.db.schemas.factTrigger.saveAlias(rex_trigger, remainder);
		} else {
			promise = this.db.schemas.factTrigger.saveFactoid(rex_trigger, remainder, route.nick);
		}

		// Respond to user
		promise.then(function () {
			route.send('Learned "' + trigger + '" -> "' + remainder + '"');
		}, function (err) {
			console.log('Error learning fact:', err);
			route.send('Error learning that fact: ' + err);
		});
	},
	explain : function (route) {
		if (last_info) {
			var out = 'That was "' + last_info.factoid + '", triggered by "' + last_info.match + '"';
			if (last_info.trigger !== '\\b' + last_info.match + '\\b') {
				out += ' matching "' + last_info.trigger + '"';
			}
			if (last_info.author) {
				out += ', authored by ' + last_info.author;
			}
			route.send(out);
		} else {
			route.send('I didn\'t do anything...');
		}
	},
	listener : function (route, message) {
		var bot = this;
		var triggered =  this.db.schemas.factTrigger.checkMessage(message);

		if (triggered) {
			triggered.trigger.getFactoid().then(function (factoid) {
				var output = factoid.factoid;

				console.log('Triggered raw fact:', output);

				// Save info about last triggered fact
				last_info = {
					factoid : factoid.factoid,
					author : factoid.author,
					trigger : triggered.trigger.trigger, //oh yes
					match : triggered.match[0]
				};

				output = output.replace(/\$who/ig, route.nick);
				output = output.replace(/\$what/ig, triggered.match[1]);

				var someone = /\$someone/i;
				while (someone.test(output)) {
					output = output.replace(someone, _.sample(bot.users.getRoomRoster(route.room)).nick);
				}

				var something = /(\$something)|(\$item)/i;
				while (something.test(output)) {
					output = output.replace(something, bot.db.schemas.word.selectByType('$item'));
				}

				_.forEach(bot.db.schemas.word.getTypes(), function (type) {
					// don't forget to add a slash before the $!!
					var regex = new RegExp('\\' + type, 'i');
					while (regex.test(output)) {
						output = output.replace(regex, bot.db.schemas.word.selectByType(type));
					}
				});

				route.indirect().send(output);
			}, function (err) {
				console.log('Error getting factoid:', err);
			});
			return true;
		} else {
			return false;
		}
	},
	have : function (route, args) {
		var bot = this;
		var type = args.shift();

		if (type[0] !== '$') {
			args.unshift(type);
			type = '$item';
		} else if (type === '$something' || type === 'item') {
			// handle silly users
			type = '$item';
		}

		var word = args.join(' ');

		bot.db.schemas.word.createIfNotExists({ type : type, word : word }).then(function () {
			if (type === '$item') {
				route.send('Thanks for ' + word + '!');
			} else {
				route.send('Adding ' + word + ' to ' + type + ' list.');
			}
		}, function (err) {
			console.log('Error adding word:', err);
			route.send('Error adding word:', err);
		});
	}
};
