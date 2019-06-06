const sequelize = require("sequelize");

module.exports = function(app) {

  const {db, cache} = app.settings;

  app.get("/api/cubeData", (req, res) => {
    res.json(cache.cubeData).end();
  });  

  app.get("/api/search", async(req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const {id, q, dimension, levels} = req.query;

    if (q) {
      where[sequelize.Op.or] = [
        {name: {[sequelize.Op.iLike]: `%${q}%`}},
        {display: {[sequelize.Op.iLike]: `%${q}%`}},
        {keywords: {[sequelize.Op.overlap]: [q]}}
      ];
    }

    if (dimension) where.dimension = dimension;
    // In sequelize, the IN statement is implicit (hierarchy: ['Division', 'State'])
    if (levels) where.hierarchy = levels.split(",");
    if (id) where.id = id.includes(",") ? id.split(",") : id;

    const rows = await db.search.findAll({
      include: [{model: db.images}],
      limit,
      order: [["zvalue", "DESC"]],
      where
    });

    /**
     * Note: The purpose of this slugs lookup object is so that in traditional, 1:1 cms sites,
     * We can translate a Dimension found in search results (like "Geography") into a slug 
     * (like "geo"). This is then passed along in the search result under the key "profile"
     * so that the search bar (in DataUSA, for example) can create a link out of it like
     * /profile/geo/Massachusetts. However, This will be insufficient for bivariate profiles, where
     * there will no longer be ONE single profile to which a search result pertains - a search
     * for "mass" could apply to both a geo and a geo_jobs (or wherever a geo Dimension is invoked)
     * Longer term, the "results" row below may need some new keys to more accurately depict the 
     * profiles to which each particular result may apply.
     */
    let meta = await db.profile_meta.findAll();
    meta = meta.map(m => m.toJSON());
    const slugs = {};
    meta.forEach(m => {
      if (!slugs[m.dimension]) slugs[m.dimension] = m.slug;
    });

    const results = rows.map(d => ({
      dimension: d.dimension,
      hierarchy: d.hierarchy,
      id: d.id,
      image: d.image,
      keywords: d.keywords,
      name: d.display,
      profile: slugs[d.dimension],
      slug: d.slug,
      stem: d.stem === 1
    }));

    res.json({
      results,
      query: {dimension, id, limit, q}
    });

  });

};
