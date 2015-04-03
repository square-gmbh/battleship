var Mongo = require("mongodb");
var MongoClient = Mongo.MongoClient;
var Server = Mongo.Server;
var config = require("../config");

var server = new Server(config.mongodb.host, config.mongodb.port, {
    native_parser: true,
    poolSize: 3
});

var driver = new MongoClient(server, {
    w: 1
});

var _connecting;
var _clientCache;
var buffer = [];

/**
 * callbacks
 * Fires all buffered callbacks
 */
function callbacks (err, client) {

    // handle error
    if (err) {
        buffer.forEach(function(cBuff) {
            cBuff.callback.call(this, err);
        });

        buffer = [];
        return;
    }

    // fire buffered callbacks
    buffer.forEach(function(cBuff) {
        cBuff.callback.call(this, null, client.db(cBuff.dbName));
    });

    buffer = [];
}

/**
 * bufferCallback
 * Buffers a callback during connecting
 */
function bufferCallback(dbName, callback) {

    if (buffer.length < 100) {
        buffer.push({ dbName: dbName, callback: callback });
    } else {
        callback(new Error("Number of callbacks in buffer exceeded."));
    }
}

/**
 * connect
 * Connects to database
 */
function connect(dbName, callback) {

    // check if db is cached
    if (_clientCache) {
        return callback(null, _clientCache.db(dbName));
    }

    // check if db is connecting
    if (_connecting) {
        return bufferCallback(dbName, callback);
    }

    _connecting = true;
    bufferCallback(dbName, callback);

    // open conection
    driver.open(function(err, client) {

        if (err) {
            _connecting = false;
            return callbacks(err, null);
        }

        _connecting = false;
        _clientCache = client;
        callbacks(null, client);
    });
}

exports.connect = connect;
exports.ObjectID = Mongo.ObjectID;