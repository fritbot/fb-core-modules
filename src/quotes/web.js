// Simply list all facts

module.exports = function (web) {
	var app = web.express();

	// Set up views!
	app.set('views', __dirname + '/../../templates');
	app.set('view engine', 'jade');

	app.get('/', web.render(app, 'quotes', function (req, next) {
		web.bot.db.schemas.quote.findQ({}).then(function (quotes) {
			next({ quotes : quotes });
		});
	}));

	app.use('/static', web.express.static(__dirname + '/../../static/'));

	web.addModuleApp('/quotes/', app, 'Quotes');
};
