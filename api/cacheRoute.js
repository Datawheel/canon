module.exports = function(app) {

  const {cache} = app.settings;

  app.get("/api/cache", (req, res) => {

    res.json(cache).end();

  });

};
