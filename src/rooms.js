function leaveRoom(route, args) {
	if (args.length == 0) {
		if (route.room) {
			route.send("Ok, bye!")
				.then(function() {
					route.connector.leaveRoom(route.room);
				});
		} else {
			route.send("We're talking privately, YOU leave!");
		}


	} else if (args.length == 1) {
		route.send("Leaving " + args[0]);
		route.connector.leaveRoom(args[0]);
	} else {
		route.send("I was only expecting one room to leave!");
	}
}

function joinRoom(route, args) {
	if (args.length == 1) {
		route.send("Jumping into " + args[0]);
		route.connector.joinRoom(args[0]);
	} else {
		route.send("I was expecting one room to join!");
	}
}

module.exports = {
	'displayname': "Room Control",
	'description': "Join or leave rooms",

	commands: [{
			'name': 'Leave Room',
			'usage': 'leave [room_name]',
			'trigger': /leave/i,
			'func': leaveRoom
		}, {
			'name': 'Join Room',
			'usage': 'join (room_name)',
			'trigger': /join/i,
			'func': joinRoom
		}
	]
}
