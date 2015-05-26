var express = require('express');
var path = require('path');
var session = require('express-session');
var MongoStore  = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var multer = require('multer');
var engines = require('consolidate');
var errorHandler = require('errorhandler');
var config = require(__dirname + '/config');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// define logger
var bole = require('bole');
bole.output({level: 'debug', stream: process.stdout});
var log = bole('server');

// all environments
app.set('views', __dirname);
app.engine('jade', engines.jade);
app.engine('html', engines.ejs);

// session
var sessionMiddleware = session({
    secret: 'B3TaL$hIp',
    saveUninitialized: false, // don't create session until something stored
    resave: false, // don't save session if unmodified
    store: new MongoStore({
        url: 'mongodb://localhost/battleships',
        ttl: 365 * 24 * 60 * 60
    })
});
app.use(sessionMiddleware);

// handle session for sockets
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

// handle application routes
app.use(require(__dirname + '/routes/router'));

// handle application operations (apis)
require(__dirname + '/operations/router')({
    app: app,
    io: io
});

// handle 404
app.use(require(__dirname + '/errors/notFound'));

server.listen(process.argv[2] || config.express.port);