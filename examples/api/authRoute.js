const authRoute = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("you are not logged in...");
};

module.exports = function(app) {

  app.get("/api/authenticated", authRoute, (req, res) => {

    res.status(202).send("you are logged in!").end();

  });

};
