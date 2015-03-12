var _ = require('lodash');

// Add quote schema to bot
module.exports = function (bot) {
    var quoteSchema = new bot.db.mongoose.Schema({
        message_id : bot.db.mongoose.Schema.Types.ObjectId,
        user_id : bot.db.mongoose.Schema.Types.ObjectId,
        nick : { type : String, required : true, index : true },
        text : { type : String, required : true },
        imported : { type : Boolean, default : false },
        date : { type : Date, default : Date.now }
    });

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
            query.nick = new RegExp(user, 'i');
        }
        obj.find(query)
            .exec(function (err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    if (data && data.length > 0) {
                        callback(null, _.sample(data, limit));
                    } else {
                        callback(null, []);
                    }
                }
            });
    };

    quoteSchema.statics.getQuoteNick = function (username, callback) {
        this.findOne({ nick : new RegExp(username) }, function (err, data) {
            if (err) {
                callback(err, null);
            } else if (data) {
                callback(null, data.nick);
            } else {
                callback(null, null);
            }
        });
    };

    bot.db.schemas.quote = bot.db.mongoose.model('Quote', quoteSchema);
};

