var _ = require('lodash');
var Q = require('q');

var loaded_triggers = [];
var loaded_words = {};

function loadTrigger(trigger) {
	// Precompile the regex
	trigger.rex = new RegExp(trigger.trigger, 'i');

	// When bot starts, let all facts be triggered immediately
	trigger.timeout = new Date();

	loaded_triggers.push(trigger);
	// Pass through trigger for deferred chaining
	return Q(trigger);
}

function loadWord(word) {
	if (!loaded_words[word.type]) {
		loaded_words[word.type] = [];
	}

	loaded_words[word.type].push(word.word);
	// Pass through trigger for deferred chaining
	return Q(word);
}

module.exports = function (bot) {

	// Create trigger schema
	var triggerSchema = new bot.db.mongoose.Schema({
		trigger : { type : String, required : true, index : true },
		alias : { type : bot.db.mongoose.Schema.Types.ObjectId, ref : 'FactTrigger' }
	});

	// Get a random factoid from this trigger.
	triggerSchema.methods.getFactoid = function () {
		return bot.db.schemas.factFactoid.findQ({ trigger : this.alias || this.id }).then(function (factoids) {
			if (factoids && factoids.length > 0) {
				return Q(_.sample(factoids));
			} else {
				return Q.reject('Nothing found.');
			}
		});
	};

	// Checks message, returns match info if trigger.
	triggerSchema.statics.checkMessage = function (message) {
		var triggers = [];
		var now = new Date();
		for (var i = 0; i < loaded_triggers.length; i ++ ) {
			var trigger = loaded_triggers[i];
			var match = message.match(trigger.rex);

			// Valid trigger ONLY if we've passed the timeout OR the matched phrase is the message exactly.
			if (match) {
				if (match[0].length === message.length || trigger.timeout < now) {
					triggers.push({ trigger : trigger, match : match });
				} else {
					console.log('Would have triggered', trigger.trigger, 'but can\'t yet');
				}
			}
		}

		return _.sample(triggers);
	};

	// Static method to save a factoid. Creates fact trigger if neccesary.
	triggerSchema.statics.saveFactoid = function (trigger, factoid, author) {

		return bot.db.schemas.factTrigger.findOneQ({ trigger : trigger }).then(function (existing_trigger) {
			// Create trigger if neccesary, if not, no-op and pass along the trigger.
			if (!existing_trigger) {
				return bot.db.schemas.factTrigger.createQ({ trigger : trigger }).then(loadTrigger);
			} else {
				return Q(existing_trigger);
			}
		}).then(function (trigger) {
			// Create the factoid.
			return bot.db.schemas.factFactoid.createQ({
				trigger : trigger._id,
				factoid : factoid,
				author : author
			});
		});

	};

	// Alias a trigger to another trigger. Accepts an ObjectID or string of the trigger.
	// aliased must exist or an error will be thrown. Passing a string will attempt to find a matching loaded trigger.
	triggerSchema.statics.saveAlias = function (trigger, aliased) {
		var orig = aliased;
		if (typeof aliased === typeof '') {
			aliased = _.find(loaded_triggers, 'trigger', aliased);
			if (!aliased) {
				aliased = _.find(loaded_triggers, 'trigger', '\\b' + orig + '\\b');
			}
		}

		if (!aliased) {
			return Q.reject('Trigger not found');
		}

		return bot.db.schemas.factTrigger.createQ({ trigger : trigger, alias : aliased.alias || aliased._id }).then(loadTrigger);
	};

	// Create trigger model
	bot.db.schemas.factTrigger = bot.db.mongoose.model('FactTrigger', triggerSchema);

	// Load all existing triggers
	bot.db.schemas.factTrigger.find({}, function (err, triggers) {
		if (err) {
			console.log('Error loading triggers:', err, '\nFacts likely will not work.');
		}
		for (var i = 0; i < triggers.length; i++) {
			var trigger = triggers[i];
			loadTrigger(trigger);
		}
	});

	// Create factoid schema
	var factoidSchema = new bot.db.mongoose.Schema({
		trigger : { type : bot.db.mongoose.Schema.Types.ObjectId, ref : 'FactTrigger', required : true, index : true },
		factoid : { type : String, required : true },
		author : { type : String, required : true }
	});

	// Create factoid model
	bot.db.schemas.factFactoid = bot.db.mongoose.model('FactFactoid', factoidSchema);

	// Create word schema
	var wordSchema = new bot.db.mongoose.Schema({
		type : { type : String, required : true, index : true },
		word : { type : String, required : true }
	});

	// Get key types
	wordSchema.statics.getTypes = function () {
		return _.keys(loaded_words);
	};

	// Get a random word, yo
	wordSchema.statics.selectByType = function (type) {
		return _.sample(loaded_words[type] || []);
	};

	// Create word if it doesn't exist
	wordSchema.statics.createIfNotExists = function (obj) {
		return this.findOneQ(obj).then(function (existing) {
			if (!existing) {
				return this.createQ(obj).then(loadWord);
			} else {
				return Q(existing);
			}
		}.bind(this));
	};

	// Create word model
	bot.db.schemas.word = bot.db.mongoose.model('Word', wordSchema);

	// Load all existing triggers
	bot.db.schemas.word.find({}, function (err, words) {
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			loadWord(word);
		}
	});
};