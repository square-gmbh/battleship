var config = require("../config");
var join = require('path').join;
var log = require('bole')('operations/sockets');

var event_cache = {};
var s;

function handleEvent (event, args, config, socket) {

    // TODO check permissions

    // cache event if it isn't already
    if (!event_cache[event]) {
        try {
            event_cache[event] = require(join(__dirname + '/' + config.path))[event];
        } catch (error) {
            return console.error(error, 'Error while caching event: ' + event);
        }
    }

    // call event handler
    event_cache[event](args, socket, s);
}

module.exports = function (core) {
    var io = core.s.io;
    s = core.s;

    // listen for connections
    io.on('connection', function (socket) {
        var host = socket.request.headers.host;
        var path = socket.request.headers.referer;

        // build sockets object
        path = path.slice(path.indexOf(host) + host.length);
        for (var route in config.routes) {
            var reg = new RegExp(config.routes[route].reg);
            if (path.match(reg)) {
                if (!s.sockets[route]) {
                    s.sockets[route] = [];
                }
                s.sockets[route].push(socket.id);
            }
        }

        // listen for events
        for (var event in config.events) {
            (function (event) {
                socket.on(event, function (args) {
                    handleEvent(event, args, config.events[event], socket);
                });
            })(event);
        }
    });
};