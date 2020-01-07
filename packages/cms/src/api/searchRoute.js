const sequelize = require("sequelize");
const yn = require("yn");

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

module.exports = function(app) {

  const {db, cache} = app.settings;

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

  app.get("/api/cubeData", (req, res) => {
    res.json(cache.cubeData).end();
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

    // Unified API Arguments:
    // =====================
    // query
    // dimension
    // hierarchy
    // limit
    // id 
    // min_confidence
    // locale
    // =====================

    if (!req.query.query) return res.json({error: "Please provide a query"});

    const locale = req.query.locale || process.env.CANON_LANGUAGE_DEFAULT || "en";
    let results = {};

    if (deepsearchAPI) {
      req.query.language = locale;
      // Pass through search params to deepsearch and extract results
      const url = `${deepsearchAPI}/search?${Object.keys(req.query).map(k => `${k}=${req.query[k]}`).join("&")}`;
      results = await axios.get(url).then(d => d.data).catch(catcher);
      results.origin = "deepsearch";
    }
    else {
      const {query} = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10; 
      const where = {};
      const searchWhere = {};
      const terms = query.split(" ");
      const orArray = [];
      terms.forEach(term => {
        orArray.push({name: {[sequelize.Op.iLike]: `%${term}%`}});
        orArray.push({keywords: {[sequelize.Op.overlap]: [query]}});
      });
      where[sequelize.Op.or] = orArray;
      where.locale = locale;
      const contentRows = await db.search_content.findAll({where}).catch(catcher);
      searchWhere.contentId = Array.from(new Set(contentRows.map(r => r.id)));
      const rows = await db.search.findAll({
        include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}],
        limit,
        order: [["zvalue", "DESC"]],
        where: searchWhere
      });
      results.origin = "legacy";
      results.results = {};
      rows.forEach(row => {
        if (!results.results[row.dimension]) results.results[row.dimension] = [];
        const content = row.content.find(c => c.locale === locale);
        results.results[row.dimension].push({
          name: content ? content.name : "",
          confidence: row.zvalue,
          metadata: {
            slug: row.slug,
            hierarchy: row.hierarchy
          },
          id: row.id,
          keywords: content && content.keywords ? content.keywords.join : ""
        });
      });
    }

    // Results are keyed by dimension. Use nonzero length dimension results to find out which profiles are a match
    const dimensions = Object.keys(results.results).filter(k => results.results[k].length > 0);
    let meta = await db.profile_meta.findAll().catch(catcher);
    meta = meta.map(d => d.toJSON());
    
    // todo: fix this OEC hack!
    const fixMeta = d => ({...d, dimension: d.dimension === "Exporter" ? "Country" : d.dimension});
    meta = meta.map(fixMeta);
    
    const relevantPids = meta.filter(p => dimensions.includes(p.dimension)).map(d => d.profile_id);
    let profiles = await db.profile.findAll({where: {id: relevantPids}, include: {association: "meta"}}).catch(catcher);
    profiles = profiles.map(d => d.toJSON());
    profiles = profiles.map(p => ({...p, meta: p.meta.map(fixMeta)}));

    // When searching for half a bilateral profile, what should be put in the other half?
    // For now, do a "top by zvalue" search so that bilateral profiles have something to show.
    // Commented out for now as folding in top elements is a little confusing in results
    // const top = await axios.get(`${deepsearchAPI}/top?limit=5`).then(d => d.data.results).catch(catcher);

    results.profiles = {};
    results.grouped = [];

    // For each profile type that was found
    for (const profile of profiles) {
      const slug = profile.meta.map(d => d.slug).join("/");
      if (slug === "ComercioBilateral/Year/Exporter") continue;
      
      // Gather a list of results that map to each slug in this profile
      const relevantResults = profile.meta.reduce((acc, m) => {
        const theseResults = results.results[m.dimension];
        if (theseResults) {
          const finalResults = theseResults.map(r => ({
            slug: m.slug,
            id: r.id,
            memberSlug: r.metadata.slug,
            name: r.name,
            ranking: r.confidence
          }));
          acc.push(finalResults);
        }
        else {
          acc.push([]);
        }
        return acc;
      }, []);

      // Take the cartesian product of the list of lists of results. For example, if you have 5 geos and
      // 5 products, create a list of 25 geo_prod results
      let combinedResults = cartesian(...relevantResults);

      // The cartesian product doesn't return a list of lists when only one array is given to it, as in the
      // case for unary profiles, so wrap the results in an array.
      const isUnary = profile.meta.length === 1;
      if (isUnary) {
        combinedResults = combinedResults.map(d => [d]);
      }
      // In the case of a bilateral profile, make sure the ids DON'T match for a given profile.
      // This prevents pages like "Germany / Germany" from being returned.
      else {
        combinedResults = combinedResults.filter(d => {
          const ids = d.map(o => o.id);
          return (new Set(ids)).size === ids.length;
        });
      }

      // If there is no space in the query, Limit results to one-dimensional profiles.
      const singleFilter = d => req.query.query.includes(" ") ? true : d.length === 1;
      
      // Save the results under a slug key for the separated-out search results. 
      const filteredResults = combinedResults.filter(singleFilter);
      if (filteredResults.length > 0) results.profiles[slug] = filteredResults;
      // Also, combine the results together for grouped results, sorted by the avg of their confidence score.
      results.grouped = results.grouped
        .concat(filteredResults)
        .map(d => {
          const avg = d.reduce((acc, d) => acc += d.ranking, 0) / d.length;
          return d.map(o => ({...o, avg}));
        })
        .sort((a, b) => b[0].avg - a[0].avg);
    }

    return res.json(results);
  };

  const search = async(req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const locale = req.query.locale || process.env.CANON_LANGUAGE_DEFAULT || "en";

    const {id, q, dimension, levels} = req.query;

    let rows = [];

    if (id) {
      where.id = id.includes(",") ? id.split(",") : id;
      if (dimension) where.dimension = dimension;
      if (levels) where.hierarchy = levels.split(",");
      rows = await db.search.findAll({
        where,
        include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}]
      });
    } 
    else {
      const searchWhere = {};
      if (q) {
        if (locale === "all") {
          where[sequelize.Op.or] = [
            {name: {[sequelize.Op.iLike]: `%${q}%`}},
            {keywords: {[sequelize.Op.overlap]: [q]}}
            // Todo - search attr and imagecontent for query
          ];
        }
        else {
          where[sequelize.Op.or] = [
            {name: {[sequelize.Op.iLike]: `%${q}%`}},
            {keywords: {[sequelize.Op.overlap]: [q]}}
          ];
          where.locale = locale;
        }
        rows = await db.search_content.findAll({where}).catch(catcher);
        searchWhere.contentId = Array.from(new Set(rows.map(r => r.id)));
      }
      if (dimension) searchWhere.dimension = dimension;
      // In sequelize, the IN statement is implicit (hierarchy: ['Division', 'State'])
      if (levels) searchWhere.hierarchy = levels.split(",");
      rows = await db.search.findAll({
        include: [{model: db.image, include: [{association: "content"}]}, {association: "content"}],
        limit,
        order: [["zvalue", "DESC"]],
        where: searchWhere
      });
    }

    // MetaEditor.jsx makes use of this endpoint, but needs ALL locale content. If locale="all" is set,
    // Forget about the ensuing sanitazation/prep for front-end searches and just return the raw rows for manipulation in the CMS.
    if (locale === "all") {
      return res.json(rows);
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

    const results = rows.map(d => {
      d = d.toJSON();
      const result = {
        dimension: d.dimension,
        hierarchy: d.hierarchy,
        id: d.id,
        image: d.image,
        profile: slugs[d.dimension],
        slug: d.slug,
        stem: d.stem === 1
      };
      const defCon = d.content.find(c => c.locale === locale);
      if (defCon) {
        result.name = defCon.name;
        result.keywords = defCon.keywords;
        result.attr = defCon.attr;
      }
      return result;
    });

    return res.json({
      results,
      query: {dimension, id, limit, q}
    });
  };

  app.get("/api/profilesearch", async(req, res) => await profileSearch(req, res));

  app.get("/api/search", async(req, res) => await search(req, res));

};
