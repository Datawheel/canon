const axios = require("axios");
const sequelize = require("sequelize");
const yn = require("yn");
const jwt = require("jsonwebtoken");

const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";
let cubeRoot = process.env.CANON_CMS_CUBES || "localhost";
if (cubeRoot.substr(-1) === "/") cubeRoot = cubeRoot.substr(0, cubeRoot.length - 1);

const {OLAP_PROXY_SECRET, CANON_CMS_MINIMUM_ROLE} = process.env;

const catcher = e => {
  if (verbose) {
    console.error("Error in imageRoute: ", e);
  }
  return [];
};

const imgCatcher = e => {
  if (verbose) {
    console.error("Error in imageRoute (Broken cloud link): ", e.message);
  }
  return false;
};

const imageInclude = {association: "image", attributes: {exclude: ["splash", "thumb"]}, include: [{association: "content"}]};

const getParentMemberWithImage = async(db, member, meta) => {
  const {id, hierarchy} = member;
  const {dimension, cubeName} = meta;
  if (cubeName) {
    const url = `${cubeRoot}/relations.jsonrecords?cube=${cubeName}&${hierarchy}=${id}:parents`;
    const config = {};
    if (OLAP_PROXY_SECRET) {
      const jwtPayload = {sub: "server", status: "valid"};
      if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
      const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
      config.headers = {"x-tesseract-jwt-token": apiToken};
    }
    const resp = await axios.get(url, config).catch(() => {
      if (verbose) console.log("Warning: Parent endpoint misconfigured or not available (imageRoute)");
      return [];
    });
    if (resp.data && resp.data.data && resp.data.data.length > 0) {
      const parents = resp.data.data.reverse();
      for (const parent of parents) {
        let parentMember = await db.search.findOne({
          where: {dimension, id: parent.value, cubeName},
          include: imageInclude
        }).catch(catcher);
        if (parentMember) {
          parentMember = parentMember.toJSON();
          if (parentMember.image) return parentMember;
        }
        else {
          return null;
        }
      }
    }
  }
  return null;
};

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/image", async(req, res) => {
    const {slug, id, memberSlug, type, t} = req.query;
    const size = req.query.size || "splash";
    const locale = req.query.locale || envLoc;
    const jsonError = () => res.json({error: "Not Found"});
    const imageError = () => res.sendFile(`${process.cwd()}/static/images/transparent.png`);
    const reqObj = req.query.dimension && req.query.cubeName ? {where: {dimension: req.query.dimension, cubeName: req.query.cubeName}} : {where: {slug}};
    const meta = await db.profile_meta.findOne(reqObj).catch(catcher);
    if (!meta) return type === "json" ? jsonError() : imageError();
    const {dimension, cubeName} = meta;
    const searchWhere = {
      where: {dimension, cubeName},
      include: imageInclude
    };
    if (memberSlug) searchWhere.where.slug = memberSlug;
    if (id) searchWhere.where[sequelize.Op.or] = {id, slug: id};
    if (req.query.level) searchWhere.where.hierarchy = req.query.level;
    let member = await db.search.findOne(searchWhere).catch(catcher);
    if (!member) return type === "json" ? jsonError() : imageError();
    member = member.toJSON();
    if (type === "json") {
      // If this member didn't have an image, attempt to find a parent image instead.
      if (!member.image) {
        const parentMember = await getParentMemberWithImage(db, member, meta);
        if (parentMember) member.image = parentMember.image;
      }
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
      let {imageId} = member;
      const bucket = process.env.CANON_CONST_STORAGE_BUCKET;
      if (["splash", "thumb"].includes(size)) {
        if (!imageId) {
          const parentMember = await getParentMemberWithImage(db, member, meta);
          if (parentMember) imageId = parentMember.imageId;
        }
        if (imageId) {
          // Check first to see if a blob is stored inside the psql row
          const imageRow = await db.image.findOne({where: {id: imageId}}).catch(() => false);
          if (imageRow && imageRow[size]) {
            res.writeHead(200,  {"Content-Type": "image/jpeg"});
            return res.end(imageRow[size], "binary");
          }
          // Otherwise, try the cloud storage location. A failure here will return a 1x1 transparent png
          else if (bucket) {
            let url = `https://storage.googleapis.com/${bucket}/${size}/${imageId}.jpg`;
            if (t) url += `?t=${t}`;
            const imgData = await axios.get(url, {responseType: "arraybuffer"}).then(resp => resp.data).catch(imgCatcher);
            if (!imgData) return imageError();
            res.writeHead(200,  {"Content-Type": "image/jpeg"});
            return res.end(imgData, "binary");
          }
          // If, for some reason, there is an imageId but not blob or bucket, return 1x1 transparent png
          else {
            return imageError();
          }
        }
        else {
          return imageError();
        }
      }
      else {
        return imageError();
      }
    }
  });

};
