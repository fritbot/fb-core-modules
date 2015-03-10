var querystring = require('querystring'),
    request = require('request'),
    util = require('util');

function googleSearch(route, args) {
    var more = args[0] === 'more',
        url;

    if (more) {
        args = args.slice(1);
    }

    url = 'http://ajax.googleapis.com/ajax/services/search/web?' + querystring.stringify({ v : '1.0', q : args.join(' ') });

    request.get(url, function (err, res, body) {
        var results = JSON.parse(body),
            data = results.responseData;

        if (data.results) {
            if (more) {
                var msg = '\n';

                for (var i = 0; i < data.results.length; i++) {
                    msg += util.format('%d: %s - %s\n', i + 1, data.results[i].titleNoFormatting, data.results[i].url);
                }
                msg += 'For more results, see ' + data.cursor.moreResultsUrl;
                route.send(msg);
            } else {
                route.send(data.results[0].titleNoFormatting + ' - ' + data.results[0].url);
            }
        } else {
            route.send('Sorry, Google doesn\'t seem to know anything about that.');
        }
    }.bind(this));
}

module.exports = {
    displayname : 'Google',
    description : 'Let me google that for you.',

    commands : [{
            name : 'Google',
            description : 'Finds the first search result. Use the "more" option to get more results.',
            usage : 'google [more ](search terms)',
            trigger : /google/i,
            func : googleSearch
        }
    ]
};