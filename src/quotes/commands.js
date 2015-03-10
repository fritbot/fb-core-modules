var QUOTE_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours ago (in milliseconds);

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

        if (quote.length === 0) {
            route.send("I can't remember nothing! Double negatives. Sometimes appropriate.");
        }

        var query = bot.db.schemas.message.findOne({ text : new RegExp(quote, 'i'), outbound : false });

        if (user) {
            query.where('user_id').equals(user.id);
        }

        query.where('date').gt(new Date(new Date().getTime() - QUOTE_TIMEOUT));
        query.sort('-date');
        query.select('id nickname text user_id');

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
                var name = 'anyone';
                if (user) { name = user.nick; }

                route.send('I don\'t remember ' + name + ' saying "' + quote + '"');
            }
        });
    },
    quote : function (route, args) {
        var bot = this,
            username = args.shift(),
            user;

        function getQuote (err, quote) {
            if (quote) {
                route.indirect().send('"' + quote.text + '"  - ' + quote.nick);
            } else {
                var name = 'anyone';
                if (user) {
                    name = user.nick;
                }
                route.send('I don\'t remember ' + name + ' saying anything like that.');
            }
        }

        if (username !== 'anyone') {
            user = bot.users.getUserMatch(username);

            if (!user) {
                user = bot.db.schemas.quote.getQuoteNick(username, function (err, user) {
                    if (!user) {
                        args.unshift(username);
                        bot.db.schemas.quote.randomOne(args.join(' '), null, getQuote);
                    } else {
                        bot.db.schemas.quote.randomOne(args.join(' '), username, getQuote);
                    }
                });
            } else {
                bot.db.schemas.quote.randomOne(args.join(' '), user.nick, getQuote);
            }
        } else {
            bot.db.schemas.quote.randomOne(args.join(' '), null, getQuote);
        }
    },
    quotemash : function () {}
};