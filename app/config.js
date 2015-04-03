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
        path: "routes/views/home.jade",
        access: {
            roles: ["user"],
            fail: "redirect",
            redirect: "/login"
        }
    },
    login: {
        reg: "/login",
        path: "routes/views/login.jade",
        access: {
            roles: ["visitator"],
            fail: "redirect",
            redirect: "/"
        }
    }
}

config.operations = {
    apiKey: "/@",
    apis: {
        getExample: {
            url: "/getExample",
            method: "get",
            path: "exampleController/controller.js",
            access: {
                roles: ["user"]
            }
        },
        login: {
            url: "/login",
            method: "post",
            path: "login/loginController.js",
            access: {
                roles: ["visitator"]
            }
        }
    }
}

if (PRODUCTION) {
    config.express.ip = "0.0.0.0";
}