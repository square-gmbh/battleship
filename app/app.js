var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var config = require(__dirname + "/config");

var app = express();

// define logger
var bole = require("bole");
bole.output({level: "debug", stream: process.stdout});
var log = bole("server");

// all environments
app.set('views', __dirname);
app.set('view engine', 'jade');
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'uwotm8' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

/* Views, Controllers, Models */
app.use(require(__dirname + "/routes/router"));

// TODO maybe config this shit

// handle 404
app.use(require(__dirname + "/errors/notFound"));

app.listen(process.argv[2] || config.express.port, config.express.ip, function (error) {

    if (error) {
        log.error("Unable to listen for connections", error);
        process.exit(10);
    }

    log.info("express is listening on http://" + config.express.ip + ":" + config.express.port);
});