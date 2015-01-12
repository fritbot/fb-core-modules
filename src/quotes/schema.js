// Add quote schema to bot
module.exports = function (bot) {
	var quoteSchema = new bot.db.mongoose.Schema({
		message_id : bot.db.mongoose.Schema.Types.ObjectId,
		user_id : bot.db.mongoose.Schema.Types.ObjectId,
		nick : String,
		text : String,
		date : { type : Date, default : Date.now },
		random : { type : Number, default : Math.random }
	});

	quoteSchema.index({ text : 'text' });

	var quoteModel = bot.db.mongoose.model('Quote', quoteSchema);

	bot.db.schemas.quote = quoteModel;
};