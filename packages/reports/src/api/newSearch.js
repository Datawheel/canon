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
    const {slug, namespace} = req.query;

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

    const allMeta = await db.report_meta.findAll().then(arr => arr.map(d => d.toJSON()));
    const allProps = allMeta.reduce((acc, d) => acc.concat(Object.values(d.properties)), []);

    const searchWhere = {include: {association: "contentByLocale"}};
    if (namespace) searchWhere.where = {namespace};
    let results = await db.search
      .findAll(searchWhere)
      .then(res => res.map(d => d.toJSON()))
      .catch(() => []);

    for (const prop of allProps) {
      if (req.query[prop]) results = results.filter(d => d.properties[prop] === req.query[prop]);
    }

    const members = results.map(result => {
      const res = ["id", "slug", "namespace"].reduce((acc, d) => ({...acc, [d]: result[d]}), result.properties);
      const content = result.contentByLocale.find(d => d.locale === locale);
      res.name = content && content.name ? content.name : result.slug;

      return res;
    });

    return res.json(members);

  });

};
