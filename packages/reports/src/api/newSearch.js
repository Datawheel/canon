const sequelize = require("sequelize");

const localeDefault = process.env.CANON_LANGUAGE_DEFAULT || "en";

const catcher = e => {
  error: `Error in newSearch: ${e}`;
};

const contentReducer = (acc, d) => ({...acc, [d.locale]: d});

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/reports/newsearch", async(req, res) => {

    const query = req.query.query || req.query.q;
    const locale = req.query.locale || localeDefault;
    const {slug} = req.query;

    if (slug) {
      const orderedSlugs = slug.split(",");
      const result = await db.search
        .findAll({where: {slug: orderedSlugs}, include: {association: "contentByLocale"}})
        .then(arr => arr
          .map(d => ({...d.toJSON(), contentByLocale: d.contentByLocale.reduce(contentReducer, {})}))
          .sort((a, b) => orderedSlugs.indexOf(a.slug) - orderedSlugs.indexOf(b.slug))
        )
        .catch(catcher);
      return res.json(result);
    }

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
