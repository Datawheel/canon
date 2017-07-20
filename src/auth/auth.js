const local = require("./local"),
      social = require("./social");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("not logged in");
};

const checkService = (app, service) => {
  if (process.env[`CANON_${service.toUpperCase()}_API`] && process.env[`CANON_${service.toUpperCase()}_SECRET`]) social(app, service);
  return;
};

module.exports = function(app) {

  const {db, passport} = app.settings;

  // mount the various authentication routes
  local(app);
  checkService(app, "facebook");
  checkService(app, "twitter");
  checkService(app, "instagram");

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => db.users.findOne({where: {id}, raw: true})
    .then(user => {
      if (user === null) done(new Error("Wrong user id."));
      done(null, user);
    })
  );

  app.get("/auth/isAuthenticated", isAuthenticated, (req, res) => res.json(req.user));

  app.get("/auth/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });

  return;

};
