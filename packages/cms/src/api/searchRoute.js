const sequelize = require("sequelize");
const yn = require("yn");
const d3Array = require("d3-array");
const jwt = require("jsonwebtoken");
const groupMeta = require("../utils/groupMeta");

const {
  CANON_CMS_CUBES,
  CANON_CMS_MINIMUM_ROLE,
  OLAP_PROXY_SECRET
} = process.env;

const engine = process.env.CANON_DB_ENGINE || "postgres";

const verbose = yn(process.env.CANON_CMS_LOGGING);
let Base58, flickr, sharp, storage;
if (process.env.FLICKR_API_KEY) {
  const Flickr = require("flickr-sdk");
  flickr = new Flickr(process.env.FLICKR_API_KEY);
  const {Storage} = require("@google-cloud/storage");
  storage = new Storage();
  sharp = require("sharp");
  Base58 = require("base58");
}
const axios = require("axios");

const validLicenses = ["4", "5", "7", "8", "9", "10"];
const validLicensesString = validLicenses.join();
const bucket = process.env.CANON_CONST_STORAGE_BUCKET;

let cubeRoot = CANON_CMS_CUBES || "localhost";
if (cubeRoot.substr(-1) === "/") cubeRoot = cubeRoot.substr(0, cubeRoot.length - 1);

const catcher = e => {
  if (verbose) {
    console.error("Error in searchRoute: ", e);
  }
  return [];
};

const splashWidth = Number(process.env.CANON_CONST_IMAGE_SPLASH_WIDTH) || 1400;
const thumbWidth = Number(process.env.CANON_CONST_IMAGE_THUMB_WIDTH) || 400;

let deepsearchAPI = process.env.CANON_CMS_DEEPSEARCH_API;
if (deepsearchAPI) deepsearchAPI = deepsearchAPI.replace(/\/$/, "");
const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => b ? cartesian(f(a, b), ...c) : a;

let unaccentExtensionInstalled;

/**
 * Check only once per boot if the unaccent extention is installed (postgres), otherwise provide a warning.
 * Install by running: "CREATE EXTENSION IF NOT EXISTS unaccent;";
 */ 
const activateUnaccent = async db => {
  if (engine === "postgres" && typeof unaccentExtensionInstalled === "undefined") {
    const [unaccentResult, unaccentMetadata] = await db.query("SELECT * FROM pg_extension WHERE extname = 'unaccent';"); //eslint-disable-line
    unaccentExtensionInstalled = unaccentMetadata.rowCount >= 1;
    if (!unaccentExtensionInstalled) {
      console.log("WARNING: For better search results, Consider installing the 'unaccent' extension in Postgres by running: CREATE EXTENSION IF NOT EXISTS unaccent;");
      console.log("Do not forget to restart the web application after installation.");
    }
  }
}; 
// The visibility or invisibility of certain profiles or variants determines which "dimension cube pairs" should be considered valid.
// When making a query into canon_cms_search, use the de-duplicated, valid, and visible dim/cubes from this array to restrict the results.
const fetchDimCubes = async db => {
  let meta = await db.profile_meta.findAll().catch(catcher);
  meta = meta.map(d => d.toJSON());
  let allProfiles = await db.profile.findAll().catch(catcher);
  allProfiles = allProfiles.map(d => d.toJSON());
  const profileVisibilityHash = allProfiles.reduce((acc, d) => ({...acc, [d.id]: d.visible}), {});
  const allDimCubes = [];
  meta.forEach(m => {
    // Only register this variant as visible if both itself and its parent profile are visible.
    const visible = profileVisibilityHash[m.profile_id] && m.visible;
    if (visible && !allDimCubes.find(d => d.dimension === m.dimension && d.cubeName === m.cubeName)) allDimCubes.push(m);
  });
  return allDimCubes;
};

// Convert a legacy-style search result into a scaffolded faked version of what the deepsearch API returns.
// This allows us to use the same collating code below, whether the results came from legacy or deepsearch.
const rowToResult = (row, locale) => {
  const content = row.content.find(c => c.locale === locale);
  return {
    name: content ? content.name : "",
    confidence: row.zvalue,
    metadata: {
      id: row.id,
      slug: row.slug,
      hierarchy: row.hierarchy,
      cube_name: row.cubeName
    },
    id: row.slug,
    keywords: content && content.keywords ? content.keywords.join : ""
  };
};

module.exports = function(app) {

  const {db} = app.settings;
  const dbQuery = db.search.sequelize.query.bind(db.search.sequelize);

  app.get("/api/isImageEnabled", async(req, res) => res.json(Boolean(flickr)));

  app.post("/api/image/update", async(req, res) => {
    if (!flickr) return res.json({error: "Flickr API Key not configured"});
    const {contentId} = req.body;
    let {id, shortid} = req.body;
    if (id && !shortid) shortid = Base58.int_to_base58(id);
    if (!id && shortid) id = Base58.base58_to_int(shortid);
    const url = `https://flic.kr/p/${shortid}`;
    const info = await flickr.photos.getInfo({photo_id: id}).then(resp => resp.body).catch(catcher);
    if (info) {
      if (validLicenses.includes(info.photo.license)) {
        const searchRow = await db.search.findOne({where: {contentId}}).catch(catcher);
        const imageRow = await db.image.findOne({where: {url}}).catch(catcher);
        if (searchRow) {
          if (imageRow) {
            await db.search.update({imageId: imageRow.id}, {where: {contentId}}).catch(catcher);
          }
          else {
            if (!bucket) {
              if (verbose) console.error("CANON_CONST_STORAGE_BUCKET not configured, failed to update image");
            }
            else {
              // To add a new image, first fetch the image data
              const sizeObj = await flickr.photos.getSizes({photo_id: id}).then(resp => resp.body).catch(catcher);
              let image = sizeObj.sizes.size.find(d => parseInt(d.width, 10) >= 1600);
              if (!image) image = sizeObj.sizes.size.find(d => parseInt(d.width, 10) >= 1000);
              if (!image) image = sizeObj.sizes.size.find(d => parseInt(d.width, 10) >= 500);
              if (!image || !image.source) {
                return res.json({error: "Flickr Source Error, try another image."});
              }
              const imageData = await axios.get(image.source, {responseType: "arraybuffer"}).then(d => d.data).catch(catcher);

              // Then add a row to the image table with the metadata.
              const payload = {
                url,
                author: info.photo.owner.realname || info.photo.owner.username,
                license: info.photo.license
              };
              const newImage = await db.image.create(payload).catch(catcher);
              await db.search.update({imageId: newImage.id}, {where: {contentId}}).catch(catcher);

              // Finally, upload splash and thumb version to google cloud.
              const configs = [
                {type: "splash", res: splashWidth},
                {type: "thumb", res: thumbWidth}
              ];
              for (const config of configs) {
                const buffer = await sharp(imageData).resize(config.res).toBuffer().catch(catcher);
                const file = `/${config.type}/${newImage.id}.jpg`;
                const options = {metadata: {contentType: "image/jpeg"}};
                await storage.bucket(bucket).file(file).save(buffer, options).catch(catcher);
                await storage.bucket(bucket).file(file).makePublic().catch(catcher);
              }
            }
          }
          const newRow = await db.search.findOne({
            where: {contentId},
            include: [
              {model: db.image, include: [{association: "content"}]}, {association: "content"}
            ]
          }).catch(catcher);
          return res.json(newRow);
        }
        else {
          return res.json("Error updating Search");
        }
      }
      else {
        return res.json({error: "Bad License"});
      }
    }
    else {
      return res.json({error: "Malformed URL"});
    }
  });

  app.get("/api/cubeData", async(req, res) => {
    // Older version of CANON_CMS_CUBES had a full path to the cube (path.com/cubes)
    // CANON_CMS_CUBES was changed to be root only, so fix it here so we can handle
    // both the new style and the old style
    const url = CANON_CMS_CUBES.replace(/[\/]{0,}(cubes){0,}[\/]{0,}$/, "/cubes");

    const s = (a, b) => {
      const ta = a.name.toUpperCase();
      const tb = b.name.toUpperCase();
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    };

    const config = {};
    if (OLAP_PROXY_SECRET) {
      const jwtPayload = {sub: "server", status: "valid"};
      if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
      const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
      config.headers = {"x-tesseract-jwt-token": apiToken};
    }

    const resp = await axios.get(url, config).then(resp => resp.data).catch(catcher);
    const cubes = resp.cubes || [];

    const dimensions = [];

    cubes.forEach(cube => {

      cube.dimensions.forEach(d => {
        const dimension = {};
        dimension.name = `${d.name} (${cube.name})`;
        dimension.cubeName = cube.name;
        dimension.dimName = d.name;
        dimension.measures = cube.measures.map(m => m.name.replace(/'/g, "\'"));
        const hierarchies = d.hierarchies.map(h => {

          const levels = h.levels.filter(l => l.name !== "(All)").map(l => {
            const parts = l.fullName
              ? l.fullName
                .split(".")
                .map(p => p.replace(/^\[|\]$/g, ""))
              : [d.name, h.name, l.name];

            if (parts.length === 2) parts.unshift(parts[0]);
            return {
              dimension: parts[0],
              hierarchy: parts[1],
              level: parts[2],
              properties: l.properties
            };
          });
          return levels;
        });
        dimension.hierarchies = Array.from(new Set(d3Array.merge(hierarchies)));
        dimensions.push(dimension);
      });
    });

    return res.json(dimensions.sort(s));
  });

  app.get("/api/flickr/search", async(req, res) => {
    if (!flickr) return res.json({error: "Flickr API Key not configured"});
    const {q} = req.query;
    const result = await flickr.photos.search({
      text: q,
      license: validLicensesString,
      sort: "relevance"
    }).then(resp => resp.body).catch(catcher);
    const photos = result.photos.photo;
    const payload = [];
    for (const photo of photos) {
      const sizeObj = await flickr.photos.getSizes({photo_id: photo.id}).then(resp => resp.body).catch(catcher);
      const small = sizeObj.sizes.size.find(d => d.label === "Small 320");
      if (small) {
        payload.push({
          id: photo.id,
          source: small.source
        });
      }
    }
    return res.json(payload);
  });

  app.post("/api/image_content/update", async(req, res) => {
    const {id, locale} = req.body;
    const defaults = req.body;
    const [row, created] = await db.image_content.findOrCreate({where: {id, locale}, defaults}).catch(catcher);
    if (created) {
      res.json(created);
    }
    else {
      row.updateAttributes(defaults).catch(catcher);
      res.json(row);
    }
  });

  app.post("/api/search/update", async(req, res) => {
    const {id, locale} = req.body;
    const update = await db.search_content.update(req.body, {where: {id, locale}}).catch(catcher);
    res.json(update);
  });

  const profileSearch = async(req, res) => {

    const allDimCubes = await fetchDimCubes(db).catch(catcher);

    const locale = req.query.locale || process.env.CANON_LANGUAGE_DEFAULT || "en";
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    let results = {};

    // Convert a legacy-style search result into a scaffolded faked version of what the deepsearch API returns.
    // This allows us to use the same collating code below, whether the results came from legacy or deepsearch.
    const rowToResult = row => {
      const content = row.content.find(c => c.locale === locale);
      return {
        name: content ? content.name : "",
        confidence: row.zvalue,
        metadata: {
          id: row.id,
          slug: row.slug,
          hierarchy: row.hierarchy,
          cube_name: row.cubeName
        },
        id: row.slug,
        keywords: content && content.keywords ? content.keywords.join : "",
        attr: content && content.attr ? content.attr : {}
      };
    };

    // If the user has provided no query, gather a sampling of top zvalue members for every possible profile
    if (!req.query.query || req.query.query === "") {
      results.origin = "legacy";
      results.results = {};
      for (const dc of allDimCubes) {
        let rows = await db.search.findAll({
          where: {dimension: dc.dimension, cubeName: dc.cubeName},
          include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}],
          order: [["zvalue", "DESC NULLS LAST"]],
          limit
        });
        // Filter out show:false from results
        rows = rows.filter(d => !d.content.map(c => c.attr).some(a => a && a.show === false));
        rows.forEach(row => {
          if (!results.results[row.dimension]) results.results[row.dimension] = [];
          results.results[row.dimension].push(rowToResult(row, locale));
        });
      }
    }
    else {
      // If deepsearch is configured, attempt to connect and query
      if (deepsearchAPI) {
        req.query.language = locale;
        // Pass through search params to deepsearch and extract results
        const url = `${deepsearchAPI}/search?${Object.keys(req.query).map(k => `${k}=${req.query[k]}`).join("&")}`;
        results = await axios.get(url).then(d => d.data).catch(e => {
          if (verbose) console.error(`Error connecting to Deepsearch, defaulting to Postgres: ${e}`);
          return false;
        });
        if (results) results.origin = "deepsearch";
      }
      if (!deepsearchAPI || deepsearchAPI && !results) {

        await activateUnaccent(db).catch(catcher);

        results = {};
        const {query} = req.query;
        const where = {};
        const searchWhere = {};
        const terms = query.split(" ");
        const orArray = [];
        terms.forEach(term => {

          // Use unaccent extension from postgres if exists.
          if (unaccentExtensionInstalled) {

            // Where by name
            orArray.push(
              sequelize.where(
                sequelize.fn("unaccent", sequelize.col("name")),
                {[sequelize.Op.iLike]: sequelize.fn("concat", "%", sequelize.fn("unaccent", term), "%")})
            );

            // Where by keywords
            orArray.push(
              sequelize.where(
                sequelize.fn("unaccent", sequelize.fn("array_to_string", sequelize.col("keywords"), " ", "")),
                {[sequelize.Op.iLike]: sequelize.fn("concat", "%", sequelize.fn("unaccent", term), "%")})
            );

          }
          else {
            // Where by name: Use simple ilike query if unaccent extension doesn't exists.
            orArray.push({name: {[sequelize.Op.iLike]: `%${term}%`}});
          }
        });

        // Where by keywords: Add simple overlap to look into keywords if unaccent extension doesn't exists.
        if (!unaccentExtensionInstalled) {
          orArray.push({keywords: {[sequelize.Op.overlap]: [query]}});
        }

        where[sequelize.Op.or] = orArray;
        where.locale = locale;
        const contentRows = await db.search_content.findAll({where}).catch(catcher);
        searchWhere.contentId = Array.from(new Set(contentRows.map(r => r.id)));
        // If the user has specified a profile by slug or id, restrict the search results to that profile's members
        if (req.query.profile) {
          // using "slug" here is not 100% correct, as profiles can be bilateral, and therefore have two slugs.
          // However, for the more common unilateral case, allow "single-slug" lookup for convenience.
          const metaWhere = !isNaN(req.query.profile) ? {profile_id: req.query.profile} : {slug: req.query.profile};
          const thisMeta = await db.profile_meta.findOne({where: metaWhere});
          if (thisMeta) {
            searchWhere.cubeName = thisMeta.cubeName;
            searchWhere.dimension = thisMeta.dimension;
            searchWhere.hierarchy = thisMeta.levels;
          }
        }
        // Also allow the user to directly limit searches by dimension and comma separated hierarchy (levels)
        // Note that this can happen in conjunction with the req.query.profile limitation above, as overrides.
        if (req.query.dimension) searchWhere.dimension = req.query.dimension.split(",");
        if (req.query.hierarchy) searchWhere.hierarchy = req.query.hierarchy.split(",");
        let rows = await db.search.findAll({
          include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}],
          // when a limit is provided, it is for EACH dimension, but this initial rowsearch is for a flat member list.
          // Pad out the limit by multiplying by the number of unique dimensions, then limit (slice) them later.
          // Not perfect, could probably revisit the logic here.
          limit: limit * allDimCubes.length,
          order: [["zvalue", "DESC NULLS LAST"]],
          where: searchWhere
        });
        results.origin = "legacy";
        results.results = {};
        // Filter out show:false from results
        rows = rows.filter(d => !d.content.map(c => c.attr).some(a => a && a.show === false));
        rows.forEach(row => {
          if (!results.results[row.dimension]) results.results[row.dimension] = [];
          results.results[row.dimension].push(rowToResult(row, locale));
        });
      }
    }

    // Results are keyed by dimension. Use nonzero length dimension results to find out which profiles are a match
    const dimCubes = [];
    Object.keys(results.results).forEach(dim => {
      if (results.results[dim].length > 0) {
        const cubes = [...new Set(results.results[dim].map(d => d.metadata.cube_name))];
        cubes.forEach(cube => {
          dimCubes.push(`${dim}/${cube}`);
        });
      }
    });

    let meta = await db.profile_meta.findAll().catch(catcher);
    meta = meta.map(d => d.toJSON());
    const relevantPids = [...new Set(meta.filter(p => dimCubes.includes(`${p.dimension}/${p.cubeName}`)).map(d => d.profile_id))];
    let profiles = await db.profile.findAll({where: {id: relevantPids, visible: true}, include: {association: "meta"}}).catch(catcher);
    profiles = profiles.map(d => d.toJSON());

    // When searching for half a bilateral profile, what should be put in the other half?
    // For now, do a "top by zvalue" search so that bilateral profiles have something to show.
    // Commented out for now as folding in top elements is a little confusing in results
    // const top = await axios.get(`${deepsearchAPI}/top?limit=5`).then(d => d.data.results).catch(catcher);

    results.profiles = {};
    results.grouped = [];

    // For each profile type that was found
    for (const profile of profiles) {
      const groupedMeta = groupMeta(profile.meta);
      const slug = groupedMeta.map(d => d[0].slug).join("/");
      // Gather a list of results that map to each slug in this profile
      const relevantResults = groupedMeta.reduce((acc, group, i) => {
        acc[i] = [];
        group.forEach(m => {
          const theseResults = results.results[m.dimension] ? results.results[m.dimension].filter(d => d.metadata.cube_name === m.cubeName && m.levels.includes(d.metadata.hierarchy)) : false;
          if (theseResults) {
            acc[i] = acc[i].concat(theseResults
              .map(r => ({
                slug: m.slug,
                id: r.metadata.id,
                memberSlug: r.metadata.slug,
                memberDimension: m.dimension,
                memberHierarchy: r.metadata.hierarchy,
                name: r.name,
                ranking: r.confidence,
                attr: r.attr ? r.attr : {}
              }))
              .slice(0, limit)
            );
          }
        });
        return acc;
      }, []);

      // Take the cartesian product of the list of lists of results. For example, if you have 5 geos and
      // 5 products, create a list of 25 geo_prod results
      let combinedResults = cartesian(...relevantResults);

      // The cartesian product doesn't return a list of lists when only one array is given to it, as in the
      // case for unary profiles, so wrap the results in an array.
      const isUnary = groupedMeta.length === 1;
      if (isUnary) {
        combinedResults = combinedResults.map(d => [d]);
      }
      // In the case of a bilateral profile, make sure the ids DON'T match for a given profile.
      // This prevents pages like "Germany / Germany" from being returned.
      else {
        combinedResults = combinedResults.filter(d => {
          const ids = d.map(o => o.id);
          return new Set(ids).size === ids.length;
        });
      }

      // If there is no space in the query, Limit results to one-dimensional profiles.
      const singleFilter = d => !req.query.query || req.query.query.includes(" ") ? true : d.length === 1;
      const filteredResults = combinedResults.filter(singleFilter);

      // Save the results under a slug key for the separated-out search results.
      if (filteredResults.length > 0) {
        results.profiles[slug] = filteredResults
          .map(d => {
            const avg = d.reduce((acc, d) => acc += d.ranking, 0) / d.length;
            return d.map(o => ({...o, avg}));
          })
          .sort((a, b) => b[0].avg - a[0].avg)
          .slice(0, limit);
      }
      // Also, combine the results together for grouped results, sorted by the avg of their confidence score.
      results.grouped = results.grouped
        .concat(filteredResults)
        .map(d => {
          const avg = d.reduce((acc, d) => acc += d.ranking, 0) / d.length;
          return d.map(o => ({...o, avg}));
        })
        .sort((a, b) => b[0].avg - a[0].avg)
        .slice(0, limit);
    }

    return res.json(results);
  };

  const search = async(req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const locale = req.query.locale || process.env.CANON_LANGUAGE_DEFAULT || "en";

    const {id, slug, dimension, levels, cubeName, pslug, parents, cms} = req.query;
    const q = req.query.q || req.query.query;

    let rows = [];

    if (slug) {
      where.slug = slug.includes(",") ? slug.split(",") : slug;
      rows = await db.search.findAll({
        where,
        include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}]
      });
    }
    else if (id) {
      where.id = id.includes(",") ? id.split(",") : id;
      if (dimension) where.dimension = dimension;
      if (levels) where.hierarchy = levels.split(",");
      if (pslug) {
        const thisMeta = await db.profile_meta.findOne({where: {slug: pslug.split(",")}});
        if (thisMeta) {
          where.cubeName = thisMeta.cubeName;
          where.dimension = thisMeta.dimension;
        }
      }
      if (cubeName) where.cubeName = cubeName;
      rows = await db.search.findAll({
        where,
        include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}]
      });
    }
    else {

      await activateUnaccent(db).catch(catcher);

      const searchWhere = {};
      if (q) {
        // Use unaccent extension from postgres if exists.
        if (unaccentExtensionInstalled) {

          where[sequelize.Op.or] = [
            // For name
            sequelize.where(
              sequelize.fn("unaccent", sequelize.col("name")),
              {[sequelize.Op.iLike]: sequelize.fn("concat", "%", sequelize.fn("unaccent", q), "%")}),
            // For keywords
            sequelize.where(
              sequelize.fn("unaccent", sequelize.fn("array_to_string", sequelize.col("keywords"), " ", "")),
              {[sequelize.Op.iLike]: sequelize.fn("concat", "%", sequelize.fn("unaccent", q), "%")})
          ];

        }
        // Use regular ilike search if unaccent is not installed.
        else {
          where[sequelize.Op.or] = [
            {name: {[sequelize.Op.iLike]: `%${q}%`}},
            {keywords: {[sequelize.Op.overlap]: [q]}}
            // Todo - search attr and imagecontent for query
          ];
        }

        if (locale !== "all") where.locale = locale;

        rows = await db.search_content.findAll({where}).catch(catcher);
        searchWhere.contentId = Array.from(new Set(rows.map(r => r.id)));
      }
      if (!cms) {
        const allDimCubes = await fetchDimCubes(db).catch(catcher);
        // allDimCubes is a list of deduplicated profile_meta rows that are considered active (visible)
        // to avoid returning search results from inactive (invisible) profiles, restrict the members
        // to only return matching dimension/cube
        searchWhere.dimension = allDimCubes.map(d => d.dimension);
        searchWhere.cubeName = allDimCubes.map(d => d.cubeName);
      }
      if (dimension) searchWhere.dimension = dimension.split(",");
      // In sequelize, the IN statement is implicit (hierarchy: ['Division', 'State'])
      if (levels) searchWhere.hierarchy = levels.split(",");
      if (pslug) {
        const thisMeta = await db.profile_meta.findAll({where: {slug: pslug.split(",")}});
        if (thisMeta && thisMeta.length > 0) {
          searchWhere.cubeName = thisMeta.map(d => d.cubeName);
          searchWhere.dimension = thisMeta.map(d => d.dimension);
        }
      }
      if (cubeName) searchWhere.cubeName = cubeName.split(",");
      rows = await db.search.findAll({
        include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}],
        limit,
        order: [["zvalue", "DESC NULLS LAST"]],
        where: searchWhere
      });
    }

    // MetaEditor.jsx makes use of this endpoint, but needs ALL locale content. If locale="all" is set,
    // Forget about the ensuing sanitazation/prep for front-end searches and just return the raw rows for manipulation in the CMS.
    if (locale === "all") {
      return res.json(rows);
    }


    // The CMS uses this endpoint to search for members to preview. CMS editors should be able to view content
    // even if hidden using {show: false}. However, when deepsearch is down, the front-end uses this basic search.
    // If coming from the CMS, don't use the filter - otherwise, use it.
    if (!cms) {
      rows = rows.filter(d => !d.content.map(c => c.attr).some(a => a && a.show === false));
    }

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

    const results = [];
    for (let d of rows) {
      d = d.toJSON();
      const result = {
        dimension: d.dimension,
        hierarchy: d.hierarchy,
        id: d.id,
        image: d.image,
        cubeName: d.cubeName,
        profile: slugs[d.dimension],
        slug: d.slug
      };
      if (parents && rows.length === 1) {
        const url = `${cubeRoot}/relations.jsonrecords?cube=${d.cubeName}&${d.hierarchy}=${d.id}:parents`;
        const config = {};
        if (OLAP_PROXY_SECRET) {
          const jwtPayload = {sub: "server", status: "valid"};
          if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
          const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
          config.headers = {"x-tesseract-jwt-token": apiToken};
        }
        const resp = await axios.get(url, config).catch(() => {
          if (verbose) console.log("Warning: Parent endpoint misconfigured or not available (searchRoute)");
          return [];
        });
        if (resp && resp.data && resp.data.data && resp.data.data.length > 0) {
          result.parents = resp.data.data;
        }
      }
      const defCon = d.content.find(c => c.locale === locale);
      if (defCon) {
        result.name = defCon.name;
        result.keywords = defCon.keywords;
        result.attr = defCon.attr;
      }
      result.content = d.content;
      results.push(result);
    }

    return res.json({
      results,
      query: {dimension, id, limit, q, parents}
    });
  };

  app.get("/api/profilesearch", async(req, res) => await profileSearch(req, res));

  app.get("/api/search", async(req, res) => await search(req, res));

};
