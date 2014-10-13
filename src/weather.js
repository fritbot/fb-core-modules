var querystring = require('querystring'),
	request = require('request');

function getWeather(route, args) {

	// API Key for Wunderground.com – no idea who "owns" this key
	apiKey = '83f199a422e382c3';

	// Parse location from the args; fall back to Austin if no location was passed
	location = args.length ? querystring.escape(args) : 'TX/Austin';

	// Set up the URL for the request
	url = 'http://api.wunderground.com/api/' + apiKey + '/conditions/q/' + location + '.json';

	// Make the request
	request.get(url, function (err, res, body) {

		// Parse the response
		var results = JSON.parse(body),
			data = results.current_observation;

		// If we have data, return a formatted version.
		if (data) {
			route.send('Current Weather for ' + data.display_location.full + ': ' + data.weather + ', ' + data.temperature_string);
		} else {
			route.send("Sorry, Wunderground doesn't seem to know anything about the weather for that location.");
		}

	}.bind(this));
}

module.exports = {
	'displayname': "Weather",
	'description': "Gets the current weather.",

	commands: [{
			'name': 'Weather',
			'description': "Gets the current weather.",
			'usage': 'weather [search term]',
			'trigger': /weather/i,
			'func': getWeather
		}
	]
};
