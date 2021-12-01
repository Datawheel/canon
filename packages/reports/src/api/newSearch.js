const sequelize = require("sequelize");

const localeDefault = process.env.CANON_LANGUAGE_DEFAULT || "en";

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/reports/newsearch", async(req, res) => {

    const query = req.query.query || req.query.q;
    const locale = req.query.locale || localeDefault;

    const results = await db.search
      .findAll({include: {association: "contentByLocale"}})
      .then(res => res.map(d => d.toJSON()))
      .catch(() => []);

    /*
    const members = results.map(d => {
      const res = ["id", "slug", "namespace"].reduce((acc, d) => )
    })
    */
    const members = [];


    return res.json(members);

  });

};
