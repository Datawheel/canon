const config = {
  facebook: [
    {
      clientID: process.env.CANON_FACEBOOK_API,
      clientSecret: process.env.CANON_FACEBOOK_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email", "birthday", "cover"]
    },
    p => ({
      id: `fb${p.id}`,
      name: p.displayName,
      facebook: p.id,
      username: p.displayName.toLowerCase().replace(" ", "-")
    })
  ],
  instagram: [
    {
      clientID: process.env.CANON_INSTAGRAM_API,
      clientSecret: process.env.CANON_INSTAGRAM_SECRET,
      callbackURL: "/auth/instagram/callback"
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
      callbackURL: "/auth/twitter/callback"
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

  const Strategy = require(`passport-${service}`).Strategy;

  passport.use(new Strategy(strat, (accessToken, refreshToken, profile, done) => {

    const searchQuery = query(profile);

    // update the user if s/he exists or add a new user
    return db.users.upsert(searchQuery).then(() => db.users.findOne({where: {id: searchQuery.id}, raw: true})
      .then((user, err) => done(err, user)));

  }));

  app.get(`/auth/${service}/`, passport.authenticate(service));

  app.get(`/auth/${service}/callback`, passport.authenticate(service, {failureRedirect: "/"}),
    (req, res) => res.redirect(process.env.CANON_SOCIAL_REDIRECT || "/"), err => console.log(`Error with ${service} login:`, err));

};
