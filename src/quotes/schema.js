// Add quote schema to bot
module.exports = function (bot) {
    var quoteSchema = new bot.db.mongoose.Schema({
        message_id : bot.db.mongoose.Schema.Types.ObjectId,
        user_id : bot.db.mongoose.Schema.Types.ObjectId,
        nick : String,
        text : String,
        imported : { type : Boolean, default : false },
        date : { type : Date, default : Date.now }
    });

    quoteSchema.index({ text : 'text' });

    quoteSchema.statics.randomOne = function (quote, user, callback) {
        quoteSchema.statics.random.call(this, quote, user, 1, function (err, selected) {
            if (err) {
                callback(err, null);
            } else if (selected.length > 0) {
                callback(null, selected[0]);
            } else {
                callback(null, null);
            }
        });
    };

    quoteSchema.statics.random = function (quote, user, limit, callback) {

        var query = {},
            obj = this;

        if (quote) {
            query.text = new RegExp(quote, 'i');
        }

        if (user) {
            query.nick = new RegExp(user.nick, 'i');
        }

        obj.count(query, function (err, count) {
            if (err) {
                return callback(err);
            }

            // Magic recursive loop
            function findOne(selected) {
                if (selected.length >= limit) {
                    callback(null, selected);
                } else {
                    var start = Math.max(0, Math.floor(count * Math.random()));
                    obj.find(query)
                        .skip(start)
                        .limit(1)
                        .exec(function (err, data) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (data.length > 0) {
                                    selected.push(data[0]);
                                    findOne(selected);
                                } else {
                                    callback(null, selected);
                                }
                            }
                        });
                }
            }

            findOne([]);

        });
    };

    bot.db.schemas.quote = bot.db.mongoose.model('Quote', quoteSchema);
};

