var _ = require('lodash');

var loaded_triggers = [];

function loadTrigger(trigger) {
	trigger.rex = new RegExp(trigger.trigger, 'i');
	loaded_triggers.push(trigger);
}

module.exports = function (bot) {

	// Create trigger schema
	var triggerSchema = new bot.db.mongoose.Schema({
		trigger : { type : String, required : true, index : true }
	});

	// Get a random factoid from this trigger.
	triggerSchema.methods.getFactoid = function (callback) {
		bot.db.schemas.factFactoid.find({ trigger : this.id }, function (err, factoids) {
			if (!err && factoids && factoids.length > 0) {
				callback(null, _.sample(factoids));
			} else {
				callback(err);
			}
		});
	};

	// Checks message, sends random factoid and the match info in callback if triggered.
	// Returns false if it knows given message will not trigger anything.
	// Returns true if message matches a trigger, even if it eventually doesn't return a factoid.
	triggerSchema.statics.checkMessage = function (message, callback) {
		var triggers = [];
		for (var i = 0; i < loaded_triggers.length; i ++ ) {
			var trigger = loaded_triggers[i];
			var match = message.match(trigger.rex);
			if (match) {
				triggers.push({ trigger : trigger, match : match });
			}
		}

		// If nothing was triggered, immediately fire null callback and return false.
		if (triggers.length === 0) {
			callback(null, null, null);
			return false;
		}

		// If something was triggered, start the async process to gather it...
		var selected = _.sample(triggers);
		selected.trigger.getFactoid(function (err, factoid) {
			console.log("got factoid", err, factoid, selected.match);
			callback(err, factoid, selected.match);
		});

		// And return true.
		return true;
	};

	// Static method to save a factoid. Creates fact trigger if neccesary.
	triggerSchema.statics.saveFactoid = function (trigger, factoid, author, callback) {
		bot.db.schemas.factTrigger.findOne({ trigger : trigger }, function (err, existing_trigger) {
			if (err) {
				callback(err);
				return;
			}

			function saveFactoidInTrigger(err, trigger) {
				if (err) {
					callback(err);
					return;
				}

				bot.db.schemas.factFactoid.create({
					trigger : trigger._id,
					factoid : factoid,
					author : author
				}, callback);
			}

			if (!existing_trigger) {
				bot.db.schemas.factTrigger.create({ trigger : trigger }, function (err, new_trigger) {
					if (!err) { loadTrigger(new_trigger); }
					saveFactoidInTrigger(err, new_trigger);
				});
			} else {
				saveFactoidInTrigger(null, existing_trigger);
			}
		});
	};

	// Create trigger model
	bot.db.schemas.factTrigger = bot.db.mongoose.model('FactTrigger', triggerSchema);

	// Load all existing triggers
	bot.db.schemas.factTrigger.find({}, function (err, triggers) {
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
};