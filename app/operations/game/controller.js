var mongo = require("../../lib/mongo");
var ObjectId = mongo.ObjectID;
var width = 10, height = 10;

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

				// init game
				initGame(s.sockets[path], s.io);
			}
		}
	}
}

function initGame (sockets, io) {

	// init turns
	sockets.turns = [];
	sockets.turn = 0;
	for (var player in sockets.players) {
		sockets.turns.push(player);
	}

	// emit first move
	sockets.players[sockets.turns[0]].emit("doMove");
	sockets.players[sockets.turns[1]].emit("wait");
}

exports.move = function (args, socket, s) {

	// get room
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);

	var sockets = s.sockets[path];
	// check if game is valid
	if (sockets.status !== "started") {
		return;
	}

	// validate args
	if (!args.hasOwnProperty("x") || !args.hasOwnProperty("y")) {
		return;
	}

	// get players based on turn
	var turnUser, waitingUser;
	if (sockets.turn) {
		turnUser = sockets.players[sockets.turns[1]];
		waitingUser = sockets.players[sockets.turns[0]];
	} else {
		turnUser = sockets.players[sockets.turns[0]];
		waitingUser = sockets.players[sockets.turns[1]];
	}

	// check if player has permission to move
	if (turnUser.id !== socket.id) {
		return;
	}

	// execute move
	switch (waitingUser.grid[args.y][args.x]) {
		case 0:
			// miss
			handleMiss();
			break;
		case 1:
			// hit
			handleHit();
			break;
		default: 
			// invalid move
			return;
	}

	function handleHit () {

		// add hit
		waitingUser.grid[args.y][args.x] = 2;

		// check end
		var end = true;
		for (var i = 0; i < height; ++i) {
			for (var j = 0; j < width; ++j) {
				if (waitingUser.grid[i][j] === 1) {
					end = false;
				}
			}
		}

		// end game
		if (end) {
			turnUser.emit("won");
			waitingUser.emit("lost");
			sockets.status = "end";
		} else {

			var move = {
				x: args.x,
				y: args.y,
				status: "hit"
			};

			// emit move status
			turnUser.emit("changeTurnUser", move);
			waitingUser.emit("changeWaitingUser", move);

			// change turn
			sockets.turn = sockets.turn ? 0 : 1;
			waitingUser.emit("doMove");
			turnUser.emit("wait");
		}
	}

	function handleMiss () {

		var move = {
			x: args.x,
			y: args.y,
			status: "miss"
		};

		// emit move status
		turnUser.emit("changeTurnUser", move);
		waitingUser.emit("changeWaitingUser", move);

		// change turn
		sockets.turn = sockets.turn ? 0 : 1;
		waitingUser.emit("doMove");
		turnUser.emit("wait");
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
			if (s.sockets[path].status !== "waiting") {
				s.sockets[path].emit("err", {
					code: 107,
					msg: "Player left"
				});
				delete s.sockets[path];
				return;

			}

			// delete room if no more players
			if (!Object.keys(s.sockets[path].players).length) {
				delete s.sockets[path];
			}
		}
	}
}