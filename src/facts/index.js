var commands = require('./commands'),
    schema_init = require('./schema');

module.exports = {
    displayname : 'Facts',
    description : 'Recites factoids in response to things people say in chat.',

    init : schema_init,

    commands : [{
            name : 'Learn Fact',
            description : 'Remember a factoid for given trigger.',
            usage : 'learn /trigger/ factoid',
            trigger : /learn/i,
            func : commands.learn
        }, {
            name : 'Explain Fact',
            description : 'Explains what fact Fritbot just recited.',
            usage : 'what was that',
            trigger : /what was that/i,
            func : commands.explain
        }
    ],

    listeners : [{
        name : 'Fact Listener',
        description : 'Listens to all text for triggers',
        trigger : /.*/,
        func : commands.listener
    }]
};