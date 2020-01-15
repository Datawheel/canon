const axios = require("axios");
const sequelize = require("sequelize");
const yn = require("yn");

const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";
let cubeRoot = process.env.CANON_CMS_CUBES;
if (cubeRoot.substr(-1) === "/") cubeRoot = cubeRoot.substr(0, cubeRoot.length - 1);

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

const getParentMemberWithImage = async(db, member, meta) => {
  const {id, hierarchy} = member;
  const {dimension, cubeName} = meta;
  if (cubeName) {
    const resp = await axios.get(`${cubeRoot}/relations.jsonrecords?cube=${cubeName}&${hierarchy}=${id}:parents`).catch(() => {
      if (verbose) console.log("Warning: Parent endpoint misconfigured or not available");
      return [];
    });
    if (resp.data && resp.data.data && resp.data.data.length > 0) {
      const parents = resp.data.data.reverse();
      for (const parent of parents) {
        let parentMember = await db.search.findOne({
          where: {dimension, id: parent.value},
          include: {model: db.image, include: [{association: "content"}]}
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
    const {slug, id, type, t} = req.query;
    const size = req.query.size || "splash";
    const locale = req.query.locale || envLoc;
    const jsonError = () => res.json({error: "Not Found"});
    const imageError = () => res.sendFile(`${process.cwd()}/static/images/transparent.png`);
    const reqObj = req.query.dimension ? {where: {dimension: req.query.dimension}} : {where: {slug}};
    const meta = await db.profile_meta.findOne(reqObj).catch(catcher);
    if (!meta) return type === "json" ? jsonError() : imageError();  
    const {dimension} = meta;
    let member = await db.search.findOne({
      where: {dimension, [sequelize.Op.or]: {id, slug: id}},
      include: {model: db.image, include: [{association: "content"}]}
    }).catch(catcher);
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
      if (bucket && ["splash", "thumb"].includes(size)) {
        if (!imageId) {
          const parentMember = await getParentMemberWithImage(db, member, meta);
          if (parentMember) imageId = parentMember.imageId;
        }
        if (imageId) {
          let url = `https://storage.googleapis.com/${bucket}/${size}/${imageId}.jpg`;
          if (t) url += `?t=${t}`;
          const imgData = await axios.get(url, {responseType: "arraybuffer"}).then(resp => resp.data).catch(imgCatcher);
          if (!imgData) return imageError();
          res.writeHead(200,  {"Content-Type": "image/jpeg"});
          return res.end(imgData, "binary");  
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
