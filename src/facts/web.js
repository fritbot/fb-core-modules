// Simply list all facts

module.exports = function (web) {
	var app = web.express();

	// Set up views!
	app.set('views', __dirname + '/../../templates');
	app.set('view engine', 'jade');

	app.get('/', web.render(app, 'facts', function (req, next) {
		web.bot.db.schemas.factFactoid.find({}).populate('trigger').execQ().then(function (facts) {
			next({ facts : facts });
		});
	}));

	app.use('/static', web.express.static(__dirname + '/../../static/'));

	web.addModuleApp('/facts/', app, 'Facts');
};
