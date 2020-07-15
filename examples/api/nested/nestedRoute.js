module.exports = function(app) {

  app.get("/api/nested", (req, res) => {

    res.json({nested: true}).end();

  });

};
