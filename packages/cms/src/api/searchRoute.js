const sequelize = require("sequelize");
const yn = require("yn");

const verbose = yn(process.env.CANON_CMS_LOGGING);
const Flickr = require("flickr-sdk");
const flickr = new Flickr(process.env.FLICKR_API_KEY);
const {Storage} = require("@google-cloud/storage");
const storage = new Storage();
const sharp = require("sharp");
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

module.exports = function(app) {

  const {db, cache} = app.settings;

  app.post("/api/image/update", async(req, res) => {
    const {id, shortid, contentId} = req.body;
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
              // To add a new image, first create a row in the table with the metadata from flickr.
              const payload = {
                url,
                author: info.photo.owner.realname || info.photo.owner.username,
                license: info.photo.license
              };
              const newImage = await db.image.create(payload).catch(catcher);
              await db.search.update({imageId: newImage.id}, {where: {contentId}}).catch(catcher);            

              // Then fetch the available sizes from flickr
              const sizeObj = await flickr.photos.getSizes({photo_id: id}).then(resp => resp.body).catch(catcher);
              let image = sizeObj.sizes.size.find(d => parseInt(d.width, 10) >= 1600);
              if (!image) image = sizeObj.sizes.size.find(d => parseInt(d.width, 10) >= 1000);
              if (!image) image = sizeObj.sizes.size.find(d => parseInt(d.width, 10) >= 500);
              const imageData = await axios.get(image.source, {responseType: "arraybuffer"}).then(d => d.data).catch(catcher);
              
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
          res.json(newRow);
        }
        else {
          res.json("Error updating Search");
        }
      }
      else {
        res.json({error: "Bad License"});
      }
    }
    else {
      res.json({error: "Malformed URL"});
    }
  });

  app.get("/api/cubeData", (req, res) => {
    res.json(cache.cubeData).end();
  });

  app.get("/api/flickr/search", async(req, res) => {
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
    res.json(payload);
  });

  app.get("/api/search/all", async(req, res) => {
    let rows = await db.search.findAll({include: [
      {model: db.image, include: [{association: "content"}]}, {association: "content"}
    ]}).catch(catcher);
    rows = rows.map(r => r.toJSON());
    res.json(rows);
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

  app.get("/api/search", async(req, res) => {

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
        include: [{model: db.image}, {association: "content"}]
      });
    } 
    else {
      if (q) {
        where[sequelize.Op.or] = [
          {name: {[sequelize.Op.iLike]: `%${q}%`}},
          {keywords: {[sequelize.Op.overlap]: [q]}}
        ];
      }
      where.locale = locale;
      rows = await db.search_content.findAll({where}).catch(catcher);
      const searchWhere = {
        contentId: Array.from(new Set(rows.map(r => r.id)))
      };
      if (dimension) searchWhere.dimension = dimension;
      // In sequelize, the IN statement is implicit (hierarchy: ['Division', 'State'])
      if (levels) searchWhere.hierarchy = levels.split(",");
      rows = await db.search.findAll({
        include: [{model: db.image}, {association: "content"}],
        limit,
        order: [["zvalue", "DESC"]],
        where: searchWhere
      });
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

    res.json({
      results,
      query: {dimension, id, limit, q}
    });

  });

};
