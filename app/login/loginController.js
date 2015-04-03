var model = require("./loginModel");

exports.login = function (source) {

    // check if user is already logged in
    if (source.req.session.role) {
        return source.status(400).send("Already logged in");
    }

    // get username and password
    var username = source.data.username;
    var password = source.data.password;

    // find user
    model.findUser({
        username: username,
        password: password
    }, function (err, user) {

        // handle error
        if (err) {
            return source.res.status(500).send(err.toString());
        }

        // user not found
        if (!user) {
            return source.res.status(400).send("Invalid login credentials");
        }

        // get the user role (if it exists)
        var role = (user.role) ? user.role : null;

        // set session
        if (role) {
            source.req.session.role = role;
        }
        source.req.session.user = {
            username: user.username
        }

        // end request
        source.res.writeHead(302, {"location": "http://" + source.req.headers.host + "/"});
        source.res.end();
    });
}