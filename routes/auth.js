// Middleware to check if user is authenticated
const auth = function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    // If no session exists, redirect to login page
    return res.redirect("/login");
  }
  // If session exists, continue to the next middleware or route
  next();
  // if (req.session.user) {
  //   return next();
  // }
  // res.redirect("/login");
};

module.exports = auth;
