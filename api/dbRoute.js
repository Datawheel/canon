module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/user", (req, res) => {

    db.User.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
