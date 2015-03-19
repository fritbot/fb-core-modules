var bot = new (require('fritbot')).scriptbot();
var CSVStreamer = require('csv-streamer');
var csv = new CSVStreamer();
var fs = require('fs');

// Some control vars
var finished_reading = false;
var quote_count = 0;
var import_count = 0;
var dupe_count = 0;

// Obligatory argv checking
if (process.argv.length < 3) {
	console.log('********************\n\nERROR: Must specify a comma-separated quotes file to import from.\n\n********************');
	bot.shutdown();
	return;
}

// The bot takes care of connecting to the DB for us. Wait until we're connected to begin streaming data.
bot.events.on('db_connected', function () {
	console.log('Database connected, importing quotes...');
	fs.createReadStream(process.argv[2]).pipe(csv);
});

// Stream incoming lines from the CSV
csv.on('data', function (line) {
	quote_count++;
	var nick = line[0];
	var text = line[1];

	// Ensure we don't duplicate quotes if we re-import
	bot.db.schemas.quote.findOne({
		nick : nick,
		text : text
	}, function (err, data) {
		if (err || data) {
			dupe_count++;
			checkFinished();
		} else {
			// If it's a new quote, write it to the DB.
			bot.db.schemas.quote.create({
				nick : nick,
				text : text
			}, function () {
				import_count++;
				checkFinished();
			});
		}
	});
});

// Ensure we finish reading the file, just in case...
csv.on('end', function () {
	finished_reading = true;
});

// Check if all async DB calls have finished. Output if so.
function checkFinished() {
	if ((import_count + dupe_count) % 100 === 0) {
		console.log('Imported', import_count + dupe_count, '/', quote_count);
	}

	// Once we're done, show the stats and tell the bot to shutdown.
	// Since the bot is fully async-aware itself, it won't shut down unless explicitly told to.
	if (finished_reading && quote_count === import_count + dupe_count) {
		console.log('\nQuotes in file:', quote_count);
		console.log('Quotes imported:', import_count);
		console.log('Duplicate quotes:', dupe_count);
		bot.shutdown();
	}
}
