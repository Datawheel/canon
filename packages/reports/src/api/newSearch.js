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

    const members = results.map(result => {
      const res = ["id", "slug", "namespace"].reduce((acc, d) => ({...acc, [d]: result[d]}), {});
      const content = result.contentByLocale.find(d => d.locale === locale);
      res.name = content && content.name ? content.name : result.slug;
      return res;
    });

    return res.json(members);

  });

};
