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

    // TODO bivariate: re-enable this slug lookup

    // const dimensions = Array.from(new Set(rows.map(d => d.dimension)));

    /*
    profiles = await db.profile.findAll({include: {association: "meta"}});
    const slugs = {};
    profiles.forEach(p => {
      if (!slugs[p.meta.dimension]) {
        slugs[p.meta.dimension] = [p]
      }
    })
    profiles = profiles.filter(p => p.meta.map(d => d.dimension).includes
    */

    /*
    const slugs = await db.profile.findAll({where: {dimension: dimensions}})
      .reduce((obj, d) => (obj[d.dimension] = d.slug, obj), {});
    */

    const results = rows.map(d => ({
      dimension: d.dimension,
      hierarchy: d.hierarchy,
      id: d.id,
      image: d.image,
      keywords: d.keywords,
      name: d.display,
      // profile: slugs[d.dimension],
      slug: d.slug,
      stem: d.stem === 1
    }));

    res.json({
      results,
      query: {dimension, id, limit, q}
    });

  });

};
