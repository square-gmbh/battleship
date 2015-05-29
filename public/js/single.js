var turn = true;
var width = 10, height = 10;

var EMPTY = null,
    SHIP = 0,
    HIT = 1,
    MISSED = 2;

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

var enemy = {
    grid: []
}

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
        // disable controls
        $(".ship").draggable("destroy").css("cursor", "default").unbind("click");
        $(this).attr("disabled", true);

        for (var i = 0; i < width * height; ++ i) {

            $temp = $("<div class='tile'></div>");

            $(".playerTwoGameBoard").append($temp);
        }
        $(".playerTwoGameBoard").append('<div class="clearfix"></div>');

        beginVolley();
    });

    initialize();
});

var hitsMade,
    enemyHitsMade,
    hitsToWin,
    ships = [5, 4, 4, 3, 2],
    probabilities = [],
    hitsSkewProbabilities = true,
    skewFactor = 2,
    boardSize = 10,
    $board;

function initialize() {
    $board = $("#board");
    setupBoard();
}

function setupBoard() {
    // initialize positions matrix
    for (var y = 0; y < boardSize; y++) {
        enemy.grid[y] = [];
        for (var x = 0; x < boardSize; x++) {
            enemy.grid[y][x] = EMPTY;
        }
    }

    // determine hits to win given the set of ships
    enemyHitsMade = hitsMade = hitsToWin = 0;
    for (var i = 0, l = ships.length; i < l; i++) {
        hitsToWin += ships[i];
    }

    distributeShips();
    recalculateProbabilities();
}

function distributeShips() {
    var pos, shipPlaced, vertical;
    for (var i = 0, l = ships.length; i < l; i++) {
        shipPlaced = false;
        vertical = randomBoolean();
        while (!shipPlaced) {
            pos = getRandomPosition();
            shipPlaced = placeShip(pos, ships[i], vertical);
        }
    }
}

function placeShip(pos, shipSize, vertical) {
    // "pos" is ship origin
    var x = pos[0],
        y = pos[1],
        z = (vertical ? y : x),
        end = z + shipSize - 1;

    if (shipCanOccupyPositionEnemy(SHIP, pos, shipSize, vertical)) {
        for (var i = z; i <= end; i++) {
            if (vertical) enemy.grid[x][i] = SHIP;
            else enemy.grid[i][y] = SHIP;
        }
        return true;
    }

    return false;
}

function recalculateProbabilities() {
    var hits = [];

    // reset probabilities
    for (var y = 0; y < boardSize; y++) {
        probabilities[y] = [];
        for (var x = 0; x < boardSize; x++) {
            probabilities[y][x] = 0;
            // we remember hits as we find them for skewing
            if (hitsSkewProbabilities && grid.grid[x][y] === HIT) {
                hits.push([x, y]);
            }
        }
    }

    // calculate probabilities for each type of ship
    for (var i = 0, l = ships.length; i < l; i++) {
        for (var y = 0; y < boardSize; y++) {
            for (var x = 0; x < boardSize; x++) {
                // horizontal check
                if (shipCanOccupyPosition(MISSED, [x, y], ships[i], false)) {
                    increaseProbability([x, y], ships[i], false);
                }
                // vertical check
                if (shipCanOccupyPosition(MISSED, [x, y], ships[i], true)) {
                    increaseProbability([x, y], ships[i], true);
                }
            }
        }
    }

    // skew probabilities for positions adjacent to hits
    if (hitsSkewProbabilities) {
        skewProbabilityAroundHits(hits);
    }
}

function increaseProbability(pos, shipSize, vertical) {
    // "pos" is ship origin
    var x = pos[0],
        y = pos[1],
        z = (vertical ? y : x),
        end = z + shipSize - 1;

    for (var i = z; i <= end; i++) {
        if (vertical) probabilities[x][i]++;
        else probabilities[i][y]++;
    }
}

function skewProbabilityAroundHits(toSkew) {
    var uniques = [];

    // add adjacent positions to the positions to be skewed
    for (var i = 0, l = toSkew.length; i < l; i++) {
        toSkew = toSkew.concat(getAdjacentPositions(toSkew[i]));
    }

    // store uniques to avoid skewing positions multiple times
    // TODO: do A/B testing to see if doing this with strings is efficient
    for (var i = 0, l = toSkew.length; i < l; i++) {
        var uniquesStr = uniques.join('|').toString();
        if (uniquesStr.indexOf(toSkew[i].toString()) === -1) {
            uniques.push(toSkew[i]);

            // skew probability
            var x = toSkew[i][0],
                y = toSkew[i][1];
            probabilities[x][y] *= skewFactor;
        }
    }
}

function getAdjacentPositions(pos) {
    var x = pos[0],
        y = pos[1],
        adj = [];

    if (y + 1 < boardSize) adj.push([x, y + 1]);
    if (y - 1 >= 0) adj.push([x, y - 1]);
    if (x + 1 < boardSize) adj.push([x + 1, y]);
    if (x - 1 >= 0) adj.push([x - 1, y]);

    return adj;
}

function shipCanOccupyPositionEnemy(criteriaForRejection, pos, shipSize, vertical) {
    // "pos" is ship origin
    var x = pos[0],
        y = pos[1],
        z = (vertical ? y : x),
        end = z + shipSize - 1;

    // board border is too close
    if (end > boardSize - 1) return false;

    // check if there's an obstacle
    for (var i = z; i <= end; i++) {
        var thisPos = (vertical ? enemy.grid[x][i] : enemy.grid[i][y]);
        if (thisPos === criteriaForRejection) return false;
    }

    return true;
}

function shipCanOccupyPosition(criteriaForRejection, pos, shipSize, vertical) {
    // "pos" is ship origin
    var x = pos[0],
        y = pos[1],
        z = (vertical ? y : x),
        end = z + shipSize - 1;

    // board border is too close
    if (end > boardSize - 1) return false;

    // check if there's an obstacle
    for (var i = z; i <= end; i++) {
        var thisPos = (vertical ? grid.grid[x][i] : grid.grid[i][y]);
        if (thisPos === criteriaForRejection) return false;
    }

    return true;
}

function beginVolley() {
    if (hitsMade > 0) setupBoard();
    var moves = 0;

    console.log(JSON.stringify(enemy.grid));

    var computerTurn = function () {

        // end condition
        if (enemyHitsMade === hitsToWin) {
            console.log("You win!");
            return;
        }

        $(".playerTwoGameBoard .tile").unbind("click");

        fireAtBestPosition();
        ++ moves;
        playerTurn();
    };

    var playerTurn = function () {

        // end condition
        if (hitsMade === hitsToWin) {
            console.log(">>> " + moves);
            return;
        }

        $(".playerTwoGameBoard .tile").click(function () {

            // get bomb coordinates
            var index = $(this).index();

            var coordinates = {
                x: index - (Math.floor(index / height) * height),
                y: Math.floor(index / height)
            }

            if (enemy.grid[coordinates.y][coordinates.x] === null) {
                enemy.grid[coordinates.y][coordinates.x] = MISSED;
            } else {
                enemy.grid[coordinates.y][coordinates.x] = HIT;
                enemyHitsMade++;
            }

            console.log(JSON.stringify(enemy.grid));
            
            var bomb;
            if (enemy.grid[coordinates.y][coordinates.x] === HIT) {
                bomb = $("<div class='explosion'></div>").css({"top": coordinates.y * 40, "left": coordinates.x * 40});
            } else {
                bomb = $("<div class='splash'></div>").css({"top": coordinates.y * 40, "left": coordinates.x * 40});
            }

            $(".playerTwoGameBoard").append(bomb);

            computerTurn();
        });
    };

    playerTurn();
}

function fireAtBestPosition() {
    var pos = getBestUnplayedPosition(),
        x = pos[0],
        y = pos[1];

    if (grid.grid[x][y] === SHIP) {
        grid.grid[x][y] = HIT;
        hitsMade++;
    } else grid.grid[x][y] = MISSED;

    recalculateProbabilities();
    
    var bomb;
    if (grid.grid[x][y] === HIT) {
        bomb = $("<div class='explosion'></div>").css({"top": x * 40, "left": y * 40});
    } else {
        bomb = $("<div class='splash'></div>").css({"top": x * 40, "left": y * 40});
    }

    $(".playerOneGameBoard").append(bomb);
}

function getBestUnplayedPosition() {
    var bestProb = 0,
        bestPos;

    // so far there is no tie-breaker -- first position
    // with highest probability on board is returned
    for (var y = 0; y < boardSize; y++) {
        for (var x = 0; x < boardSize; x++) {
            if (!grid.grid[x][y] && probabilities[x][y] > bestProb) {
                bestProb = probabilities[x][y];
                bestPos = [x, y];
            }
        }
    }

    return bestPos;
}

function getRandomPosition() {
    var x = Math.floor(Math.random() * 10),
        y = Math.floor(Math.random() * 10);

    return [x, y];
}

function randomBoolean() {
    return (Math.round(Math.random()) == 1);
}