module.exports = function(app) {

  app.get("/api/simple", (req, res) => {

    res.json({simple: false});

  });

  app.get("/api/slug/:slug", (req, res) => {

    res.json({slug: req.params.slug});

  });

  app.post("/api/raw", (req, res) => {

    res.send(req.rawBody).end();

  });

};
