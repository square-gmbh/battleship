var mongo = require("../../lib/mongo");
var ObjectId = mongo.ObjectID;

exports.createRoom = function (source) {
	
	var roomId = new ObjectId();

	source.res.setHeader("Location", "/r/" + roomId);
	source.res.status(302).end();
};

exports.ready = function (args, socket, s) {

	// get room path
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);

	if (!args.grid || !args.ships) {
		return;
	}

	if (!s.sockets[path] || !s.sockets[path].players || !s.sockets[path].players[socket.id]) {
		socket.emit('err', {
            code: 108,
            msg: "Player not in room"
        });
        return;
	}

	if (s.sockets[path].status !== "waiting") {
		socket.emit('err', {
            code: 109,
            msg: "Wrong status"
        });
        return;
	}

	// add ship and grid configuration
	var player = s.sockets[path].players[socket.id];
	player.grid = args.grid;
	player.ships = args.ships;
	player.ready = true;

	// check if game is ready to start
	var PLAYERS_TO_CHECK = 2;
	for (var player in s.sockets[path].players) {
		if (s.sockets[path].players[player].ready) {
			if (!--PLAYERS_TO_CHECK) {
				// game ready to start
				s.sockets[path].status = "started";

				s.sockets[path].emit("start");
			}
		}
	}
}

exports.disconnect = function (args, socket, s) {

	// get room path
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);

	// check if room exists
	if (s.sockets[path]) {
		// check if player exists
		if (s.sockets[path].players && s.sockets[path].players[socket.id]) {
			delete s.sockets[path].players[socket.id];

			// TODO end game
			if (!Object.keys(s.sockets[path].players).length) {
				delete s.sockets[path];
			}
		}
	}
}