const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const uuid = require("d3plus-common").uuid;

module.exports = function(app) {

  const {db, passport} = app.settings;

  passport.use(new Strategy({usernameField: "email"},
    (email, password, done) => db.users.findOne({where: {email}, raw: true})
      .then(user => {

        if (user === null) return done(null, false, {message: "Incorrect credentials."});

        const hashedPassword = bcrypt.hashSync(password, user.salt);

        if (user.password === hashedPassword) return done(null, user);
        return done(null, false, {message: "Incorrect credentials."});

      })
  ));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    db.users.findOne({where: {id}, raw: true}).then(user => {
      if (user === null) done(new Error("Wrong user id."));
      done(null, user);
    });
  });

  app.post("/auth/local/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/local/fail",
    failureFlash: false
  }));

  app.post("/auth/local/signup", (req, res) => {

    const email = req.body.email;
    db.users.findOne({where: {email}})
      .then(err => {

        if (err) res.status(409).json({message: "A user with that email already exits!"});

        const username = req.body.username;
        db.users.findOne({where: {username}})
          .then(err => {

            if (err) res.status(409).json({message: "A user with that email already exits!"});

            const password = req.body.password;
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const newUser = {
              id: uuid(),
              email,
              username,
              salt,
              password: hashedPassword
            };

            db.users.create(newUser)
              .then(() => passport.authenticate("local")(req, res, () => res.redirect("/")))
              .catch(() => res.status(500).json({message: "Passwords did not match."}));

          });

      });

  });

  app.get("/auth/local/fail", (req, res) => res.status(401).send("error logging in"));

};
