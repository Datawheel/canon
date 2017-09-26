const Strategy = require("passport-local").Strategy;
const uuid = require("d3plus-common").uuid;

const BuildMail = require("buildmail"),
      Mailgun = require("mailgun-js"),
      bcrypt = require("bcrypt-nodejs"),
      fs = require("fs"),
      path = require("path");

const {name} = JSON.parse(require("shelljs").cat("package.json"));

const activationRoute = process.env.CANON_ACTIVATION_LINK || "/activate",
      canonActivation = process.env.CANON_SIGNUP_ACTIVATION,
      mgApiKey = process.env.CANON_MAILGUN_API,
      mgDomain = process.env.CANON_MAILGUN_DOMAIN,
      mgEmail = process.env.CANON_MAILGUN_EMAIL,
      mgName = process.env.CANON_MAILGUN_NAME || name,
      resetRoute = process.env.CANON_RESET_LINK || "/reset";

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("not logged in");
};

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

              return db.users.create(newUser).then(user => {
                if (canonActivation && mgApiKey && mgDomain && mgEmail) {
                  sendActivation(user, req, error => done(null, false, error), () => done(null, user));
                }
                else done(null, user);
              });

            });

        });

    }));

  app.post("/auth/local/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureFlash: false
  }));

  function sendActivation(user, req, err, done) {

    const mailgun = new Mailgun({apiKey: mgApiKey, domain: mgDomain});
    const confirmEmailFilepath = path.join(__dirname, "emails/activation.html");

    user.activateToken = bcrypt.genSaltSync();
    const expiryHours = 48;
    user.activateTokenExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    return user.save().then(() => {


      const {activateToken, email} = user;

      fs.readFile(confirmEmailFilepath, "utf8", (error, template) => {

        if (error) return err(error);

        const url = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
        const render = template
          .replace(/{{username}}/g, user.username)
          .replace(/{{site_url}}/g, url)
          .replace(/{{site_name}}/g, mgName)
          .replace(/{{confirm_link}}/g, `${url}${activationRoute}?email=${email}&token=${activateToken}`);

        return new BuildMail("text/html")
          .addHeader({from: mgEmail, subject: "Please verify your email address", to: email})
          .setContent(render).build((error, mail) => {
            if (error) return err(error);
            return mailgun.messages().sendMime({to: email, message: mail.toString("ascii")}, done);
          });

      });

    });

  }

  if (mgApiKey && mgDomain && mgEmail) {

    app.set("mailgun", true);

    app.get("/auth/sendActivation", isAuthenticated, (req, res) => {

      const {email} = req.query;

      db.users.findOne({where: {email}}).then(user => {
        if (user) {
          return sendActivation(user, req, error => res.json({error}), () => res.json({success: true}));
        }
        else {
          return res.json({error: true});
        }
      });

    });

    app.get("/auth/activate", (req, res) => {
      const {email, token} = req.query;

      db.users.findOne({where: {email, activateToken: token}})
        .then(user => {

          if (user) {
            if (user.activateTokenExpiry < new Date(Date.now())) {
              user.activateTokenExpiry = null;
              user.activateToken = null;
              return user.save().then(() => res.json({success: false}));
            }
            else {
              user.activateTokenExpiry = null;
              user.activateToken = null;
              user.activated = true;
              return user.save().then(() => res.json({success: true}));
            }
          }
          else {
            return res.json({success: false});
          }

        });
    });

    app.get("/auth/resetPassword", (req, res) => {

      const {email} = req.query;

      db.users.findOne({where: {email}}).then(user => {
        if (user) {

          const mailgun = new Mailgun({apiKey: mgApiKey, domain: mgDomain});
          const resetEmailFilepath = path.join(__dirname, "emails/resetPassword.html");

          user.resetToken = bcrypt.genSaltSync();
          const expiryHours = 2;
          user.resetTokenExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
          return user.save().then(() => {

            fs.readFile(resetEmailFilepath, "utf8", (error, template) => {

              if (error) return res.json({error});
              const url = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
              const render = template
                .replace(/{{site_url}}/g, url)
                .replace(/{{site_name}}/g, mgName)
                .replace(/{{reset_link}}/g, `${url}${resetRoute}?token=${user.resetToken}`);

              return new BuildMail("text/html")
                .addHeader({from: mgEmail, subject: "Password Reset", to: email})
                .setContent(render).build((error, mail) => {
                  if (error) return res.json({error});
                  return mailgun.messages().sendMime({to: email, message: mail.toString("ascii")}, () => res.json({success: true}));
                });

            });
          });
        }
        else {
          return res.json({error: true});
        }
      });

    });

    app.get("/auth/validateReset", (req, res) => {
      const {token} = req.query;
      db.users.findOne({where: {resetToken: token}})
        .then(user => {
          if (user) {
            if (user.resetTokenExpiry < new Date(Date.now())) {
              user.resetTokenExpiry = null;
              user.resetToken = null;
              return user.save().then(() => res.json({success: false}));
            }
            else {
              return res.json({success: true});
            }
          }
          else {
            return res.json({success: false});
          }
        });
    });

    app.post("/auth/changePassword", (req, res) => {

      const {password, token} = req.body;
      const newSalt = bcrypt.genSaltSync(10);
      const newHashedPassword = bcrypt.hashSync(password, newSalt);

      db.users.findOne({where: {resetToken: token}})
        .then(user => {
          if (user) {
            user.resetToken = null;
            user.resetTokenExpiry = null;
            user.salt = newSalt;
            user.password = newHashedPassword;
            return user.save().then(() => res.json({success: true}));
          }
          else {
            return res.json({success: false});
          }
        });

    });

  }

};
