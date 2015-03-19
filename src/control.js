function squelch (route) {
    if (route.room) {
        this.intent.squelch(route.room);
        route.send("Ok, I'll shut up for ten minutes.");
    } else {
        route.send("I can't be quiet, I'm only talking to you!");
    }
}

function unsquelch (route) {
    if (route.room) {
        this.intent.squelch(route.room, false);
        route.send("And we're back.");
    } else {
        route.send('...');
    }
}

module.exports = {
    displayname : 'Control',
    description : 'Core control functionality, like squelch/unsquelch',

    commands : [{
            name : 'Silence',
            description : 'Stops the bot listening or accepting non-core commands in this room for 10 minutes',
            usage : 'silence',
            trigger : /(silence)|(shut ?up)|(squelch)|(go away)/i,
            func : squelch,
            core : true
        },
        {
            name : 'Return',
            description : 'Returns the bot to normal functionality after being silenced.',
            usage : 'come back',
            trigger : /(come back)|(unsquelch)/i,
            func : unsquelch,
            core : true
        }
    ]
};