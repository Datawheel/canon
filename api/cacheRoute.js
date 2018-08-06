module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/user", async(req, res) => {

    const u = await db.testTable.findAll({where: req.query});
    res.json(u).end();

  });

};
