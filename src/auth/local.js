const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const uuid = require("d3plus-common").uuid;

module.exports = function(app) {

  const {db, passport} = app.settings;

  passport.use("local-login", new Strategy({usernameField: "email"},
    (email, password, done) => db.users.findOne({where: {email}, raw: true})
      .then(user => {

        if (user === null) return done(null, false, {message: "Incorrect credentials."});

        const hashedPassword = bcrypt.hashSync(password, user.salt);

        if (user.password === hashedPassword) return done(null, user);
        return done(null, false, {message: "Incorrect credentials."});

      })
  ));

  app.post("/auth/local/login", passport.authenticate("local-login", {
    successRedirect: "/",
    failureFlash: false
  }));

  passport.use("local-signup", new Strategy({usernameField: "email", passReqToCallback: true},
    (req, email, password, done) => {

      db.users.findOne({where: {email}, raw: true})
        .then(user => {

          if (user) return done(null, false, {message: "E-mail already exists."});

          const username = req.body.username;
          return db.users.findOne({where: {username}, raw: true})
            .then(user => {

              if (user) return done(null, false, {message: "Username already exists."});

              const salt = bcrypt.genSaltSync(10);
              const hashedPassword = bcrypt.hashSync(password, salt);

              const newUser = {
                id: uuid(),
                email,
                username,
                salt,
                password: hashedPassword
              };

              return db.users.create(newUser).then(user => done(null, user));

            });

        });

    }));

  app.post("/auth/local/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureFlash: false
  }));

};
