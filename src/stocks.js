var querystring = require('querystring'),
    request = require('request');

function getStocks(route, args) {

    if (args.length === 0) {
        route.send('Perhaps you should provide a stock symbol... ?');
        return;
    }

    // Parse stock symbols from the args
    var symbols = args.map(function (symbol) {
        return symbol.replace(/,/g, '');
    });

    // Set up the URL for the request
    var url = 'http://www.google.com/finance/info?infotype=infoquoteall&q=' + querystring.escape(symbols);

    // Make the request
    request.get(url, function (err, res, body) {

        if (res.statusCode === 200) {

            // Parse the response
            var response = JSON.parse(body.replace('\\x26','&').replace('// [','['));

            // If there is a response, parse/return it
            if (response.length > 0) {
                var stockValues = [];

                for (var index in response) {
                    stockValues.push('     ' + response[index].name + ' closed yesterday at $' + (parseFloat(response[index].l) - parseFloat(response[index].c)).toFixed(2).toString() + '; opened today at $' + response[index].op + ' and is currently at $' + response[index].l + ' (' + response[index].cp + '% from close)');
                }

                route.send('Stock prices for ' + symbols.join(', ') + ':\n' + stockValues.join('\n'));
            }

        } else {
            route.send("Erm... something went very wrong. Maybe that's not a stock symbol?");
        }

    }.bind(this));
}

module.exports = {
    displayname : 'Stocks',
    description : 'Returns information for the requested stock symbol.',

    commands : [{
            name : 'Stocks',
            description : 'Returns information for the requested stock symbol.',
            usage : 'stock [search term]',
            trigger : /stock/i,
            func : getStocks
        }
    ]
};
