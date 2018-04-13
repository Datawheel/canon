let socialRedirectUrl = process.env.CANON_SOCIAL_REDIRECT || "/";
socialRedirectUrl = !socialRedirectUrl.endsWith("/") ? `${socialRedirectUrl}/` : socialRedirectUrl;

const parseEmail = p => p.emails && p.emails.length ? p.emails[0].value : null;
const addEmail = (userData, p) => {
  const email = parseEmail(p);
  return email ? {...userData, email} : userData;
};

const config = {
  facebook: [
    {
      clientID: process.env.CANON_FACEBOOK_API,
      clientSecret: process.env.CANON_FACEBOOK_SECRET,
      callbackURL: `${socialRedirectUrl}auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email", "birthday", "cover"],
      scope: ["public_profile", "email"]
    },
    p => {
      const userData = {
        id: `fb${p.id}`,
        name: p.displayName,
        facebook: p.id,
        username: p.displayName.toLowerCase().replace(" ", "-")
      };

      return addEmail(userData, p);
    }
  ],
  google: [
    {
      clientID: process.env.CANON_GOOGLE_API,
      clientSecret: process.env.CANON_GOOGLE_SECRET,
      callbackURL: `${socialRedirectUrl}auth/google/callback`,
      scope: ["profile", "email"],
      module: "google-oauth20"
    },
    p => {
      const userData = {
        id: `goog${p.id}`,
        name: p.displayName,
        google: p.id,
        username: p.displayName.toLowerCase().replace(" ", "-")
      };
      return addEmail(userData, p);
    }
  ],
  github: [
    {
      clientID: process.env.CANON_GITHUB_API,
      clientSecret: process.env.CANON_GITHUB_SECRET,
      callbackURL: `${socialRedirectUrl}auth/github/callback`,
      scope: ["user", "user:email"]
    },
    p => {
      const userData = {
        id: `gh${p.id}`,
        name: p.displayName,
        github: p.id,
        username: p.displayName.toLowerCase().replace(" ", "-")
      };
      return addEmail(userData, p);
    }
  ],
  instagram: [
    {
      clientID: process.env.CANON_INSTAGRAM_API,
      clientSecret: process.env.CANON_INSTAGRAM_SECRET,
      callbackURL: `${socialRedirectUrl}auth/instagram/callback`
    },
    p => ({
      id: `ig${p.id}`,
      name: p.displayName,
      instagram: p.id,
      username: `${p.displayName.toLowerCase().replace(" ", "-")}-${p.id}`
    })
  ],
  linkedin: [
    {
      clientID: process.env.CANON_LINKEDIN_API,
      clientSecret: process.env.CANON_LINKEDIN_SECRET,
      callbackURL: `${socialRedirectUrl}auth/linkedin/callback`,
      module: "linkedin-oauth2",
      scope: ["r_basicprofile", "r_emailaddress"]
    },
    p => {
      const userData = {
        id: `li${p.id}`,
        name: p.displayName,
        linkedin: p.id,
        username: p.displayName.toLowerCase().replace(" ", "-")
      };
      return addEmail(userData, p);
    }
  ],
  twitter: [
    {
      consumerKey: process.env.CANON_TWITTER_API,
      consumerSecret: process.env.CANON_TWITTER_SECRET,
      callbackURL: `${socialRedirectUrl}auth/twitter/callback`
    },
    p => ({
      id: `t${p.id}`,
      name: p.displayName,
      twitter: p.username,
      username: p.username
    })
  ]
};

module.exports = function(app, service) {

  const {db, passport, social} = app.settings;

  const [strat, query] = config[service];
  social.push(service);

  const servicePackage = strat.module || service;
  const Strategy = require(`passport-${servicePackage}`).Strategy;

  passport.use(new Strategy(strat, (accessToken, refreshToken, profile, done) => {

    const searchQuery = query(profile);

    // update the user if s/he exists or add a new user
    return db.users.upsert(searchQuery)
      .then(() => db.users.findOne({where: {id: searchQuery.id}, raw: true})
        .catch(err => console.log(err))
        .then((user, err) => done(err, user)));

  }));

  const authOptions = strat.scope ? {scope: strat.scope} : null;
  app.get(`/auth/${service}/`, passport.authenticate(service, authOptions));

  app.get(`/auth/${service}/callback`, passport.authenticate(service, {failureRedirect: "/"}),
    (req, res) => res.redirect(socialRedirectUrl), err => console.log(`Error with ${service} login:`, err));

};
