var querystring = require('querystring'),
    request = require('request');

function getWeather(route, args) {

    // API Key for Wunderground.com – no idea who "owns" this key
    var apiKey = '83f199a422e382c3';

    // Parse location from the args; fall back to Austin if no location was passed
    var location = args.length ? querystring.escape(args.map(function (x) { return x.replace(/,/g, ''); })) : 'TX/Austin';

    // Set up the URL for the request
    var url = 'http://api.wunderground.com/api/' + apiKey + '/conditions/q/' + location + '.json';

    // Make the request
    request.get(url, function (err, res, body) {

        // Parse the response
        var results = JSON.parse(body),
            data = results.current_observation;

        if (data) {
            // If we have weather data, return a formatted version
            route.send(data.display_location.full + ': ' + data.weather + '; ' + data.temp_f + '° F (feels like ' + data.feelslike_f + '° F); winds ' + data.wind_string.substring(0, 1).toLowerCase() + data.wind_string.substring(1));
        } else if (results.response.results) {
            // If Wunderground returns a list of cities, list them
            var possibilities = [];
            for (var index in results.response.results) {
                possibilities.push('     ' + (parseInt(index) + 1) + '. ' + results.response.results[index].city + ', ' + results.response.results[index].state + ' ' + results.response.results[index].country);
            }
            route.send('Wunderground found a few possibilities; try one of the following instead:\n' + possibilities.join('\n'));
        } else if (results.response.error) {
            // If Wunderground returns an error, print it
            route.send('Wunderground says: "' + results.response.error.description + '"');
        } else {
            // If we get this far, reply with a witty message
            route.send("I don't know what you wanted, but you're not getting it (unknown error).");
        }

    }.bind(this));
}

module.exports = {
    displayname : 'Weather',
    description : 'Gets the current weather.',

    commands : [
        {
            name : 'Weather',
            description : 'Gets the current weather.',
            usage : 'weather [search term]',
            trigger : /weather/i,
            func : getWeather
        }
    ]
};
