const sequelize = require("sequelize");
const {generateUnaccentedQuery} = require("../utils/search/unaccent");

const localeDefault = process.env.CANON_LANGUAGE_DEFAULT || "en";

const catcher = e => {
  error: `Error in newSearch: ${e}`;
};

const contentReducer = (acc, d) => ({...acc, [d.locale]: d});

module.exports = function(app) {

  const {db} = app.settings;
  const dbQuery = db.search.sequelize.query.bind(db.search.sequelize);

  app.get("/api/reports/newsearch", async(req, res) => {

    // Extract params
    const query = req.query.query || req.query.q;
    const locale = req.query.locale || localeDefault;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const {all, slug, namespace} = req.query;

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

    // todo1.0 return top 10s
    if (!query) {
      if (all) {
        const results = await db.search.findAll({limit, include: {association: "contentByLocale"}}).then(arr => arr
          .map(d => ({...d.toJSON(), contentByLocale: d.contentByLocale.reduce(contentReducer, {})})));
        return res.json(results);
      }
      else return res.json([]);
    }

    // Namespaces may have properties - in traditional tesseract these were hierarchy, level, etc.
    // At the time of import, users may set arbitrary properties for a given namespace, which can be searched.
    const allMeta = await db.report_meta.findAll().then(arr => arr.map(d => d.toJSON()));
    const allProps = allMeta.reduce((acc, d) => acc.concat(Object.values(d.properties)), []);

    const orArray = await generateUnaccentedQuery(dbQuery, query.split(" "));
    const contentRows = await db.search_content.findAll({
      where: {
        locale,
        [sequelize.Op.or]: orArray
      }
    }).catch(catcher);

    const searchWhere = {
      [sequelize.Op.or]:
        [
          // If the user searched by name, it must be matched against the result set from the earlier search_content query
          {contentId: Array.from(new Set(contentRows.map(r => r.id)))},
          // If the user searched by direct id, it must be matched against the id itself directly the in search table
          {id: {[sequelize.Op.iLike]: `%${query}%`}}
        ],
      ...namespace && {namespace}
    };

    /* // todo1.0 - how to work this in using new properties?
        // If the user has specified a report(s), restrict the search results to those cubes
        if (req.query.report) {
          searchWhere.cubeName = allDimCubes.map(dc => dc.cubeName);
          searchWhere.dimension = allDimCubes.map(dc => dc.dimension);
          searchWhere.hierarchy = unique(
            d3Array.merge(allDimCubes.map(dc => dc.levels))
          );
        }
        // Also allow the user to directly limit searches by and comma separated dimension, hierarchy, and cube.
        // Note that this can happen in conjunction with the req.query.report limitation above, as overrides.
        if (req.query.dimension) {
          searchWhere.dimension = req.query.dimension.split(",");
        }
        if (req.query.hierarchy) {
          searchWhere.hierarchy = req.query.hierarchy.split(",");
        }
        if (req.query.cubeName) {
          searchWhere.cubeName = req.query.cubeName.split(",");
        }
    */

    let results = await db.search
      .findAll({
        // todo1.0 fix this
        // include: imageIncludeNoBlobs,
        // when a limit is provided, it is for EACH dimension, but this initial rowsearch is for a flat member list.
        // Pad out the limit by multiplying by the number of unique dimensions, then limit (slice) them later.
        // Not perfect, could probably revisit the logic here.
        // limit: limit * allDimCubes.length,
        include: {association: "contentByLocale"},
        limit,
        order: [["zvalue", "DESC NULLS LAST"]],
        where: searchWhere
      })
      .then(arr => arr.map(d => ({...d.toJSON(), contentByLocale: d.contentByLocale.reduce(contentReducer, {})})))
      .catch(() => []);

    for (const prop of allProps) {
      if (req.query[prop]) results = results.filter(d => d.properties[prop] === req.query[prop]);
    }

    if (all) return res.json(results);

    const members = results.map(result => {
      const res = ["id", "slug", "namespace"].reduce((acc, d) => ({...acc, [d]: result[d]}), result.properties);
      const content = result.contentByLocale[locale];
      res.name = content && content.name ? content.name : result.slug;
      return res;
    });

    return res.json(members);

  });

};
