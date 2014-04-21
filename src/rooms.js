function leaveRoom(route, args) {
	if (args.length == 0) {
		this.send(route, "Ok, bye!")
			.then(function() {				
				this.connector.leaveRoom(route.room);	
			});

	} else if (args.length == 1) {
		this.send(route, "Leaving " + args[0]);
		this.connector.leaveRoom(args[0]);
	} else {
		this.send(route, "I was only expecting one room to leave!");
	}
}

function joinRoom(route, args) {
	if (args.length == 1) {
		this.send(route, "Jumping into " + args[0]);
		this.connector.joinRoom(args[0]);
	} else {
		this.send(route, "I was expecting one room to join!");
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
