var express = require("express");
var join = require("path").join;
var log = require("bole")("operations/router");
var config = require("../config");
var router = new express.Router();

// config static files
router.use(express.static(join(__dirname, "../../public")));

// view render function
function renderView (req, res, view) {

    // check if user has access to this view
    if (view.access && view.access.roles) {
        var userRole = req.session.role || "visitator";
        if (view.access.roles.indexOf(userRole) === -1) {
            // user does not have permission
            if (view.access.fail === "redirect" && view.access.redirect) {
                var location = 'http://' + req.headers.host + view.access.redirect;
                res.writeHead(302, {"location": location});
                res.end();
                return;
            }

            // show an error
            // TODO use some kind of error template
            return res.status(403).send("You do not have permission for this");
        }
    }

    res.render(view.path);
}

// config routes
for (var route in config.routes) {

    (function (route) {
        // validate route config
        if (!config.routes[route].reg || !config.routes[route].path) {  
            return log.error("Route " + route + " has an invalid configuration");
        }
        var re = new RegExp(config.routes[route].reg);

        // listen route request
        router.use(re, function (req, res) {
            renderView(req, res, config.routes[route]);
        });
    })(route);
}

module.exports = router;