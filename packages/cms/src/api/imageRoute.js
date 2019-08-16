const axios = require("axios");
const sequelize = require("sequelize");
const request = require("request");
const yn = require("yn");

const {CANON_LOGICLAYER_CUBE} = process.env;
const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";

const slugMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  napcs: "NAPCS",
  soc: "PUMS Occupation",
  university: "University"
};

const catcher = e => {
  if (verbose) {
    console.error("Error in searchRoute: ", e);
  }
  return [];
};

module.exports = function(app) {

  const {db} = app.settings;
  
  /* CMS 0.8+ IMAGE ROUTE */
  /* See below for legacy Datausa Route */

  app.get("/api/image", async(req, res) => {
    const {slug, id, type} = req.query;
    const size = req.query.size || "splash";
    const locale = req.query.locale || envLoc;
    const jsonError = () => res.json({error: "Not Found"});
    const imageError = () => res.sendFile(`${process.cwd()}/static/images/transparent.png`);
    const meta = await db.profile_meta.findOne({where: {slug}}).catch(catcher);
    if (!meta) return type === "json" ? jsonError() : imageError();
    const {dimension} = meta;
    let member = await db.search.findOne({
      where: {dimension, [sequelize.Op.or]: {id, slug: id}},
      include: {model: db.image, include: [{association: "content"}]}
    }).catch(catcher);
    if (!member) return type === "json" ? jsonError() : imageError();
    member = member.toJSON();
    if (type === "json") {
      if (member.image && member.image.content) {
        const content = member.image.content.find(d => d.locale === locale);
        if (content) {
          member.image.meta = content.meta;
          delete member.image.content;
        }
      }
      return res.json(member);
    }
    else {
      const {imageId} = member;
      const bucket = process.env.CANON_CONST_STORAGE_BUCKET;
      if (imageId && bucket && ["splash", "thumb"].includes(size)) {
        const url = `https://storage.googleapis.com/${bucket}/${size}/${imageId}.jpg`;
        return request.get(url).pipe(res);
      }
      else {
        return imageError();
      }
    }
  });

  /* LEGACY DATAUSA IMAGE ROUTE */

  const {parents} = app.settings.cache;

  app.get("/api/profile/:pslug/:pid/:size", (req, res) => {
    const {size, pid, pslug} = req.params;

    function sendImage(image) {
      if (image) res.sendFile(`${process.cwd()}/static/images/profile/${size}/${image}.jpg`);
      else if (pslug === "university") res.sendFile(`${process.cwd()}/static/images/profile/${size}/2032.jpg`);
      else res.sendFile(`${process.cwd()}/static/images/profile/${size}/1849.jpg`);
    }

    db.search.findOne({where: {id: pid, dimension: slugMap[pslug]}})
      .then(attr => {

        /* when the query returns nothing, exit early. this was added because 
        the code that follows crashes sequelize when it tries to use a null attr
        TODO: more gracefully handle not founds
        */
        if (!attr) {
          sendImage(); 
          return;
        }

        const {imageId} = attr;

        if (!imageId) {

          if (parents[pslug]) {

            const ids = parents[pslug][pid];

            db.search.findAll({where: {id: ids, dimension: slugMap[pslug]}})
              .then(parentAttrs => {
                const parentImage = parentAttrs
                  .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                  .find(p => p.imageId).imageId;
                sendImage(parentImage);
              });

          }
          else if (pslug === "geo") {

            axios.get(`${CANON_LOGICLAYER_CUBE}geoservice-api/relations/parents/${attr.id}`)
              .then(d => d.data.reverse())
              .then(d => d.map(p => p.geoid))
              .then(d => {
                const attrs = db.search.findAll({where: {id: d, dimension: slugMap[pslug]}});
                return Promise.all([d, attrs]);
              })
              .then(([ids, parentAttrs]) => {
                const parentImage = parentAttrs
                  .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                  .find(p => p.imageId).imageId;
                sendImage(parentImage);
              });

          }
          else sendImage();

        }
        else sendImage(imageId);
      });
  });

};
