const sequelize = require("sequelize");

const localeDefault = process.env.CANON_LANGUAGE_DEFAULT || "en";

const catcher = e => {
  error: `Error in newSearch: ${e}`;
};

const contentReducer = (acc, d) => ({...acc, [d.locale]: d});

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/reports/newsearch", async(req, res) => {

    // Extract params
    const query = req.query.query || req.query.q;
    const locale = req.query.locale || localeDefault;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const {slug, namespace} = req.query;

    // If the slug was provided, this is a direct lookup, find the members and return them.
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

    // Namespaces may have properties - in traditional tesseract these were hierarchy, level, etc.
    // At the time of import, users may set arbitrary properties for a given namespace, which can be searched.
    const allMeta = await db.report_meta.findAll().then(arr => arr.map(d => d.toJSON()));
    const allProps = allMeta.reduce((acc, d) => acc.concat(Object.values(d.properties)), []);

    // If a query has been provided, then the search must be done against the *content* table, after which
    // further narrowing can occur on the member table.
    /*
    if (query) {
      db
    }
    */

    const searchWhere = {
      where: {
        ...(query && {query}),  //eslint-disable-line
        ...(namespace && {namespace}) //eslint-disable-line
      },
      include: {association: "contentByLocale"}
    };

    if (searchWhere.query)

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
