// import twitter from "./twitter";
// import facebook from "./facebook";
// import instagram from "./instagram";
const local = require("./local");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("not logged in");
};

module.exports = function(app) {

  // mount the various authentication routes
  local(app);
  // app.use("/auth/local", );
  // app.use("/twitter", twitter(app));
  // app.use("/facebook", facebook(app));
  // app.use("/instagram", instagram(app));

  app.get("/auth/isAuthenticated", isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  app.get("/auth/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });

};
