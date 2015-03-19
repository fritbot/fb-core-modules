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
			route.send('I didn\'t do anything...')
		}
	},
	listener : function (route, message) {
		var bot = this;
		var triggered =  this.db.schemas.factTrigger.checkMessage(message);

		if (triggered) {
			triggered.trigger.getFactoid().then(function (factoid) {
				var output = factoid.factoid;

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

				route.indirect().send(output);
			}, function (err) {
				console.log('Error getting factoid:', err);
			});
			return true;
		} else {
			return false;
		}
	}
};
