let socialRedirectUrl = process.env.CANON_SOCIAL_REDIRECT || "/";
socialRedirectUrl = !socialRedirectUrl.endsWith("/") ? `${socialRedirectUrl}/` : socialRedirectUrl;

const config = {
  facebook: [
    {
      clientID: process.env.CANON_FACEBOOK_API,
      clientSecret: process.env.CANON_FACEBOOK_SECRET,
      callbackURL: `${socialRedirectUrl}auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email", "birthday", "cover"]
    },
    p => ({
      id: `fb${p.id}`,
      name: p.displayName,
      facebook: p.id,
      username: p.displayName.toLowerCase().replace(" ", "-")
    })
  ],
  google: [
    {
      clientID: process.env.CANON_GOOGLE_API,
      clientSecret: process.env.CANON_GOOGLE_SECRET,
      callbackURL: `${socialRedirectUrl}auth/google/callback`,
      scope: ["profile"],
      module: "google-oauth20"
    },
    p => ({
      id: `goog${p.id}`,
      name: p.displayName,
      google: p.id,
      username: p.displayName.toLowerCase().replace(" ", "-")
    })
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
