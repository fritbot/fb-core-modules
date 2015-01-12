module.exports = {
	remember : function (route, args) {
		var bot = this,
			username = args.shift(),
			user, quote;

		user = bot.users.getUserMatch(username);

		if (!user) {
			args.unshift(username);
		}

		quote = args.join(' ');

		var query = bot.db.schemas.message.findOne({ text : new RegExp(quote, 'i') });

		if (user) {
		 	query.where('user_id').equals(user.id);
		}

		query.exec(function (err, quotedata) {
			if (quotedata) {
				if (route.user._id.toString() === quotedata.user_id.toString()) {
					route.send('You can\'t remember yourself. Say something funnier next time, and maybe someone else will remember you.');
				} else {
					bot.db.schemas.quote.findOne({ message_id : quotedata.id }, function (err, priordata) {
						if (priordata) {
							route.send('Yeah, I already remembered that. Apparently you didn\'t.');
						} else {
							route.send('Remembering ' + quotedata.nickname + ': ' + quotedata.text);

							bot.db.schemas.quote.create({
								message_id : quotedata.id,
								user_id : route.user.id,
								nick : quotedata.nickname,
								text : quotedata.text
							});
						}
					});
				}
			} else {
				if (user) {
					route.send('I don\'t remember ' + user.nick + ' saying "' + quote + '"');
				} else {
					route.send('I don\'t remember anyone saying "' + quote + '"');
				}
			}
		});
	},
	quote : function () {},
	quotemash : function () {}
};