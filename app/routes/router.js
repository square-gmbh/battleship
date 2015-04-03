var express = require("express");
var join = require("path").join;
var config = require("../config");
var router = new express.Router();

// config static files
router.use(express.static(join(__dirname, "../../public")));

// view render function
function renderView (req, res, path) {
	res.render(path);
}

// config routes
for (var route in config.routes) {
	var re = new RegExp(config.routes[route].reg);

	(function (route) {
		router.use(re, function (req, res) {
			renderView(req, res, config.routes[route].path);
		});
	})(route);
}

module.exports = router;