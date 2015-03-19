var bot = new (require('fritbot')).scriptbot();
var CSVStreamer = require('csv-streamer');
var Q = require('q');
var async = require('async');
var csv = new CSVStreamer();
var fs = require('fs');

var lines = [];
var count = 0;

//  Obligatory argv checking
if (process.argv.length < 3) {
	console.log("********************\n\nERROR: Must specify a comma-separated facts file to import from.\n\n********************");
	bot.shutdown();
	return;
}

// The bot takes care of connecting to the DB for us. Wait until we're connected to begin streaming data.
bot.events.on('db_connected', function () {
	console.log("Database connected, reading CSV...");
	fs.createReadStream(process.argv[2]).pipe(csv);
});

// Stream incoming lines from the CSV
csv.on('data', function (line) {
	count++;
	lines.push(line);
});

// Function to process a single line.
// Since we need these to happen strictly in sequence, so we can get aliases matched, we need to mix Q and async.
function processLine (line, callback) {
	var trigger = line[0];

	// Required to drop the args to callback so async doesn't think we're throwing an error.
	function cb () {
		callback();
	}

	if (trigger === 'alias') {
		bot.db.schemas.factTrigger.saveAlias(line[1], line[2]).then(cb);
	} else {
		bot.db.schemas.factTrigger.saveFactoid(trigger, line[1], line[2]).then(cb);
	}
}

// Once we're done reading the file, wait until the promises resolve.
csv.on('end', function () {
	console.log("Importing facts to database...");
	async.eachSeries(lines, processLine, function () {
		console.log("Finished processing", count, "facts");
		bot.shutdown();
	});
});
