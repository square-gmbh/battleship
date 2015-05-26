var express = require('express');
var log = require('bole')('operations/router');
var config = require('../config');
var join = require('path').join;
var router = new express.Router();

// operation cache
var operations_cache = {};

// sockets
var s = {
    sockets: {}
};

function handleOperation(req, res, config, operation) {

    // check if user has permission to run this operation
    if (config.access && config.access.roles) {
        var userRole = (req.session.login) ? req.session.login.role || "visitator" : "visitator";
        if (config.access.roles.indexOf(userRole) === -1) {
            // TODO use some kind of error template
            return res.status(403).send('access denied');
        }
    }

    console.log(join(__dirname + '/' + config.path));

    // cache operation file it isn't already
    if (!operations_cache[operation]) {
        try {
            operations_cache[operation] = require(join(__dirname, config.path))[operation];
        } catch (error) {
            log.error(error, 'Error while caching operation: ' + operation);
            return res.status(500).send('Error while caching operation: ' + operation);
        }
    }

    // build operation source
    var source = {
        method: req.method,
        headers: req.headers,
        req: req,
        url: req.url,
        res: res
    }

    // handle POST and GET request data
    if (req.method === 'POST') {
        source.data = req.body;

        // call operation
        operations_cache[operation](source);
    } else if (req.method === 'GET') {
        source.data = req.query;

        // call operation
        operations_cache[operation](source);
    }
}

module.exports = function (core) {
    // use router
    core.app.use(router);

    // init sockets
    s.io = core.io;
    core.s = s;
    require('./sockets')(core);

    // init operations
    for (var operation in config.operations.apis) {

        (function (operation) {

            // validate operation method
            if (!config.operations.apis[operation].method) {
                log.error('Method not configured for operation: ' + operation);
                return;
            }

            // validate operation url
            if (!config.operations.apis[operation].url) {
                log.error('Url not configured for operation: ' + operation);
                return;
            }

            // listen for api requests (POST or GET)
            if (config.operations.apis[operation].method == 'get') {
                router.get(config.operations.apiKey + config.operations.apis[operation].url, function (req, res) {
                    handleOperation(req, res, config.operations.apis[operation], operation);
                });
            } else if (config.operations.apis[operation].method == 'post') {
                router.post(config.operations.apiKey + config.operations.apis[operation].url, function (req, res) {
                    handleOperation(req, res, config.operations.apis[operation], operation);
                });
            }
        })(operation);
    }

}