var mongo = require("../../lib/mongo");
var ObjectId = mongo.ObjectID;

exports.createRoom = function (source) {
	
	var roomId = new ObjectId();

	source.res.setHeader("Location", "/r/" + roomId);
	source.res.status(302).end();
};