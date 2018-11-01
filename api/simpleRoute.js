module.exports = function(app) {

  app.get("/api/simple", (req, res) => {

    res.json({simple: false}).end();

  });

  app.get("/api/slug/:slug", (req, res) => {

    res.json({slug: req.params.slug}).end();

  });

};
