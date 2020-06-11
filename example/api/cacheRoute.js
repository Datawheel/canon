module.exports = function(app) {

  const {cache} = app.settings;

  app.get("/api/cache", async(req, res) => {

    res.json(cache.const).end();

  });

};
