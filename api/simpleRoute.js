module.exports = function(app) {

  app.get("/api/simple", (req, res) => {

    res.json({simple: false}).end();

  });

};
