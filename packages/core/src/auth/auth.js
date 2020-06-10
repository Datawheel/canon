const local = require("./local"),
      social = require("./social");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(200).json({authenticated: false});
};

const isRole = role => (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role >= role) return next();
    else res.status(401).send("user does not have sufficient privileges");
  }
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
  checkService(app, "github");
  checkService(app, "google");
  checkService(app, "instagram");
  checkService(app, "linkedin");
  checkService(app, "twitter");

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => db.users.findOne({where: {id}, raw: true})
    .then(user => {
      if (user === null) done(new Error("Wrong user id."));
      done(null, user);
    })
  );

  app.get("/auth/isAuthenticated", isAuthenticated, (req, res) => res.json({...req.user, authenticated: true}));

  app.get("/auth/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });

  app.get("/auth/users", isRole(2), (req, res) => {

    const {limit, offset, role} = req.query;

    const query = {where: {}};
    if (limit !== undefined) query.limit = limit;
    if (offset !== undefined) query.offset = offset;
    if (role !== undefined) query.where.role = role;

    db.users.findAll(query)
      .then(users => res.json(users.sort((a, b) => b.role - a.role)))
      .catch(err => console.log(err));

  });

  app.post("/auth/users/update", isRole(2), (req, res) => {

    const {id, role} = req.query;

    db.users.findOne({where: {id}})
      .then(user => {
        user.role = role;
        user.save().then(user => res.json(user));
      })
      .catch(err => console.log(err));

  });

  return;

};
