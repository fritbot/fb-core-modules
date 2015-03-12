module.exports = {
	learn : function (route, args) {
		var trigger = args.shift();
		var factoid = args.join(' ');
		var rex_trigger;

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

		this.db.schemas.factTrigger.saveFactoid(rex_trigger, factoid, route.nick, function () {
			route.send('Learned ' + trigger + ' -> "' + factoid + '"');
		});
	},
	explain : function (route) {
		route.send('No, Fuck you!');
	},
	listener : function (route, message) {
		// Yes, this function has both a return value AND callback.
		// The function returns true if it thinks it may trigger, even if it eventually does not.
		// It returns false if it knows it will not trigger.
		var p =  this.db.schemas.factTrigger.checkMessage(message, function (err, factoid, match) {
			console.log(err, factoid, match);
			if (!err && factoid) {
				route.indirect().send(factoid.factoid);
			}
		});
		return p;
	}
};
