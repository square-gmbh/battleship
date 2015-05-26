var boardConfiguration = {
	ship1: {
		rotation: 0,
		x: 6,
		y: 8
	},
	ship2: {
		rotation: 0,
		x: 5,
		y: 7
	},
	ship3: {
		rotation: 0,
		x: 4,
		y: 6
	},
	ship4: {
		rotation: 0,
		x: 3,
		y: 5
	},
	ship5: {
		rotation: 0,
		x: 2,
		y: 6
	}
};

$(document).ready(function () {

	// initialize ui
	$(".friendURL").val(window.location.href);

	// initialize board
	for (var ship in boardConfiguration) {
		$("." + ship).css({"top": boardConfiguration[ship].y * 40, "left": boardConfiguration[ship].x * 40});
	}

	for(var i = 0; i < 100; ++ i) {

		$temp = $("<div class='tile'></div>");

		$(".playerOneGameBoard").append($temp);
	}
	$(".playerOneGameBoard").append('<div class="clearfix"></div>');

	for(var i = 0; i < 100; ++ i) {
		$(".playerTwoGameBoard").append('<div class="tile"></div>');
	}
	$(".playerTwoGameBoard").append('<div class="clearfix"></div>');

	// detect drag
	$(".ship").draggable({
		grid: [40, 40],
		containment: "#board",
		obstacle: ".obstacle",
		preventCollision: true,
		refreshPositions: true,
		start: function (event, ui) {
			$(".ship").removeClass("obstacle");
			$(".ship:not(.ui-draggable-dragging)").addClass("obstacle");
		}
	});

	// detect position change
	$(".ship").click(function () {
		if ($(this).attr("vertical")) {
			$(this).removeAttr("vertical").attr("horizontal", "");
		} else {
			$(this).removeAttr("horizontal").attr("vertical", "");
		}
	});
});