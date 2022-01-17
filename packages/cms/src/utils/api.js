/**
 * Helper function for canon APIs - determines whether user is logged in or not
 */
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("not logged in");
};

/**
 * Helper function for canon APIs - determines whether user is the provided role
 * 0 - regular user
 * 1 - admin user
 * 2 - superuser
 */
const isRole = role => (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role >= role) return next();
    else res.status(401).send("user does not have sufficient privileges");
  }
  return res.status(401).send("not logged in");
};

module.exports = {isAuthenticated, isRole};
