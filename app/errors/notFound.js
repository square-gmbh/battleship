var config = ("../config");

function notFound(req, res) {
  res.status(404).render("errors/404.jade");
}

module.exports = notFound;