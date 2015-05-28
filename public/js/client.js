// socket init
var socket = io();

socket.on("err", function (error) {
	alert(error.msg);
});

socket.on("start", function () {
	console.log("merge");
});

var width = 10, height = 10;
var EMPTY = 0,
	SHIP = 1,
	HIT = 2,
	MISSED = 3;

var SHIP_CONIFG = [
	{
		x: 2,
		y: 7,
		length: 3
	},
	{
		x: 3,
		y: 6,
		length: 4
	},
	{
		x: 4,
		y: 5,
		length: 5
	},
	{
		x: 5,
		y: 6,
		length: 4
	},
	{
		x: 6,
		y: 8,
		length: 2
	}
];

var grid = {
	grid: null,
	ships: [],
	init: function () {
		
		// initialize grid
		this.grid = [];
		for (var i = 0; i < width; ++ i) {
			this.grid[i] = [];
			for (var j = 0; j < height; ++ j) {
				this.grid[i][j] = EMPTY;
			}
		}

		// intialize ships
		for (var i = 0; i < SHIP_CONIFG.length; ++ i) {
			var ship = new Ship(SHIP_CONIFG[i], i);
			this.ships.push(ship);
		}

		for (var i = 0; i < this.ships.length; ++ i) {
			this.move(this.ships[i], this.ships[i].x, this.ships[i].y);
		}

		renderBoard();
	},
	move: function (ship, newX, newY) {
		var ok = true;

		// delete old position from grid
		var shipEndX = (ship.orientation === "vertical") ? ship.x : ship.x + ship.length - 1;
		var shipEndY = (ship.orientation === "vertical") ? ship.y + ship.length - 1 : ship.y;
		for (var i = ship.x; i <= shipEndX; ++i) {
			for (var j = ship.y; j <= shipEndY; ++j) {
				this.grid[j][i] = EMPTY;
			}
		}

		// check for colisions
		var newEndX = (ship.orientation === "vertical") ? newX : newX + ship.length - 1;
		var newEndY = (ship.orientation === "vertical") ? newY + ship.length - 1 : newY;
		for (var i = newX; i <= newEndX; ++i) {
			for (var j = newY; j <= newEndY; ++j) {
				if (grid.grid[j][i] === SHIP) {
					ok = false;
				}
			}
		}

		if (ok) {
			// add new postion to grid
			for (var i = newX; i <= newEndX; ++i) {
				for (var j = newY; j <= newEndY; ++j) {
					grid.grid[j][i] = SHIP;
				}
			}
		} else {
			// add old positions back
			for (var i = ship.x; i <= shipEndX; ++i) {
				for (var j = ship.y; j <= shipEndY; ++j) {
					grid.grid[j][i] = SHIP;
				}
			}
		}

		return ok;
	},
	rotate: function (ship) {
		var ok = true;

		var newEndX = (ship.orientation === "horizontal") ? ship.x : ship.x + ship.length - 1;
		var newEndY = (ship.orientation === "horizontal") ? ship.y + ship.length - 1 : ship.y;

		// check if new position is on grid
		if (newEndX >= height) {
			return false;
		}
		if (newEndY >= width) {
			return false;
		}


		// delete old position from grid
		var shipEndX = (ship.orientation === "vertical") ? ship.x : ship.x + ship.length - 1;
		var shipEndY = (ship.orientation === "vertical") ? ship.y + ship.length - 1 : ship.y;
		for (var i = ship.x; i <= shipEndX; ++i) {
			for (var j = ship.y; j <= shipEndY; ++j) {
				this.grid[j][i] = EMPTY;
			}
		}

		// check for colisions
		for (var i = ship.x; i <= newEndX; ++i) {
			for (var j = ship.y; j <= newEndY; ++j) {
				if (grid.grid[j][i] === SHIP) {
					ok = false;
				}
			}
		}

		if (ok) {
			// add new postion to grid
			for (var i = ship.x; i <= newEndX; ++i) {
				for (var j = ship.y; j <= newEndY; ++j) {
					grid.grid[j][i] = SHIP;
				}
			}
		} else {
			// add old positions back
			for (var i = ship.x; i <= shipEndX; ++i) {
				for (var j = ship.y; j <= shipEndY; ++j) {
					grid.grid[j][i] = SHIP;
				}
			}
		}

		return ok;
	}
};

var Ship = function (config, index) {
	this.x = config.x;
	this.y = config.y;
	this.index = index;
	this.length = config.length;
	this.orientation = "vertical";
}

Ship.prototype.move = function (x, y) {
	// check position in grid
	var ok = grid.move(this, x, y);

	// change ship position
	if (ok) {
		this.x = x;
		this.y = y;
	}

	return ok;
};

Ship.prototype.rotate = function () {
	var ok = grid.rotate(this);

	// change ship position
	if (ok) {
		this.orientation = this.orientation === "vertical" ? "horizontal" : "vertical";
	}

	return ok;
}

var bomb = {
	x: null,
	y: null,
	state: null,
	placeBomb: function (x, y) {

	}
}

function renderBoard () {

	// initialize board
	for (var i = 0; i < grid.ships.length; ++ i) {
		$(".ship" + i).css({"top": grid.ships[i].y * 40, "left": grid.ships[i].x * 40});
	}

	for (var i = 0; i < width * height; ++ i) {

		$temp = $("<div class='tile'></div>");

		$(".playerOneGameBoard").append($temp);
	}
	$(".playerOneGameBoard").append('<div class="clearfix"></div>');
}

$(document).ready(function () {

	// initialize ui
	$(".friendURL").val(window.location.href);

	grid.init();

	// detect drag
	$(".ship").draggable({
		grid: [40, 40],
		containment: "#board",
		revert: function (ship) {
			var index = $(this).attr('data-ship');
			$(this).data("draggable").originalPosition = {top: grid.ships[index].y * 40, left: grid.ships[index].x * 40};

			// try to move the ship
			var newX = $(this).data("draggable").position.left / 40;
			var newY = $(this).data("draggable").position.top / 40;
			var ok = grid.ships[index].move(newX, newY);

			return !ok;
		}
	});

	// detect position change
	$(".ship").click(function () {
		var index = $(this).attr('data-ship');
		
		var ok = grid.ships[index].rotate();

		if (ok) {
			if ($(this).attr("vertical")) {
				$(this).removeAttr("vertical").attr("horizontal", "horizontal");
			} else {
				$(this).removeAttr("horizontal").attr("vertical", "vertical");
			}
		}
	});

	$(".ready").click(function () {
		socket.emit("ready", {
			grid: grid.grid,
			ships: grid.ships
		});
	});
});
