var express = require("express");
var join = require("path").join;
var log = require("bole")("operations/router");
var config = require("../config");
var router = new express.Router();

// config static files
router.use(express.static(join(__dirname, "../../public")));

// handler cache
var handler_cache = {};

// view render function
function renderView (req, res, config, view) {

    // check if user has access to this view
    if (config.access && config.access.roles) {
        var userRole = (req.session.login) ? req.session.login.role || "visitator" : "visitator";

        if (config.access.roles.indexOf(userRole) === -1) {

            // user does not have permission
            if (config.access.fail === "redirect" && config.access.redirect) {
                var location = 'http://' + req.headers.host + config.access.redirect;
                res.writeHead(302, {"location": location});
                res.end();
                return;
            }

            // show an error
            // TODO use some kind of error template
            return res.status(403).send("You do not have permission for this");
        }
    }

    // check if a custom handler exists
    if (config.handler) {
        // cache handler if it doesn't exist
        if (!handler_cache[view]) {
            try {
                handler_cache[view] = require(join(__dirname, config.handler))[view];
            } catch (error) {
                log.error(error, 'Error while caching view handler: ' + config.handler);
                return res.status(500).send('Error while caching view handler: ' + config.handler);
            }
        }

        // call handler
        handler_cache[view](req, res, config, view);
    } else {
        res.render(config.path);
    }
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
            renderView(req, res, config.routes[route], route);
        });
    })(route);
}

module.exports = router;