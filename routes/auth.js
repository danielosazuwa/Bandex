// Middleware to check if user is authenticated
const auth = function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

module.exports = auth;
