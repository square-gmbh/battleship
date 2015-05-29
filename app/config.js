var config = module.exports;
var PRODUCTION = process.env.NODE_ENV === "production";

config.express = {
    port: process.env.EXPRESS_PORT || 9191,
    ip: "127.0.0.1"
};

config.mongodb = {
    port: process.env.MONGODB_PORT || 27017,
    host: process.env.MONGODB_HOST || "localhost"
};

config.routes = {
    home: {
        reg: "^/*$",
        path: "routes/views/home.jade"
    },
    room: {
        reg: "^/r/[^/]+/*$",
        path: "routes/views/room.jade"
    },
    single: {
        reg: "/single",
        path: "routes/views/single.jade"
    }
}

config.operations = {
    apiKey: "/@",
    apis: {
        createRoom: {
            url: "/createRoom",
            method: "get",
            path: "game/controller.js"
        }
    }
}

config.events = {
    ready: {
        path: "game/controller.js"
    },
    disconnect: {
        path: "game/controller.js"
    },
    move: {
        path: "game/controller.js"
    }
}

if (PRODUCTION) {
    config.express.ip = "0.0.0.0";
}