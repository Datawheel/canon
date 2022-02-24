const axios = require("axios");
const jwt = require("jsonwebtoken");
const {fetchMemberFromMemberIdOrSlug} = require("../utils/search/searchHelpers");

const path = require("path");
const transparent = path.resolve("../packages/reports/static/images/transparent.png");

const {axiosConfig, localeDefault, verbose} = require("../utils/canon/getCommonConfigs")();
const bucket = process.env.CANON_CONST_STORAGE_BUCKET;

// todo1.0 remove/handle tesseract
let cubeRoot = process.env.CANON_CMS_CUBES || "localhost";
if (cubeRoot.substring(-1) === "/") cubeRoot = cubeRoot.substring(0, cubeRoot.length - 1);
const cubeEnabled = cubeRoot !== "localhost";

const {OLAP_PROXY_SECRET, CANON_REPORTS_MINIMUM_ROLE} = process.env;

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

const imageInclude = {association: "image", attributes: {exclude: ["splash", "thumb"]}, include: [{association: "contentByLocale"}]};

// todo1.0 update this for 1.0
const getParentMemberWithImage = async(db, member, meta) => {
  const {id, hierarchy} = member;
  const {dimension, cubeName} = meta;
  if (cubeName) {
    const url = `${cubeRoot}/relations.jsonrecords?cube=${cubeName}&${hierarchy}=${id}:parents`;
    const config = {};
    if (OLAP_PROXY_SECRET) {
      const jwtPayload = {sub: "server", status: "valid"};
      if (CANON_REPORTS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_REPORTS_MINIMUM_ROLE;
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

  app.get("/api/newimage", async(req, res) => {
    const {dimension: queryDimension, member: queryMember, type, t} = req.query;
    const size = req.query.size || "splash";
    const locale = req.query.locale || localeDefault;
    const jsonError = () => res.json({error: "Not Found"});
    const imageError = () => res.sendFile(transparent);
    const member = await fetchMemberFromMemberIdOrSlug(db, queryMember, queryDimension, true)
      .then(d => d.toJSON())
      .catch(catcher);
    if (!member) return type === "json" ? jsonError() : imageError();
    if (type === "json") {
      // If this member didn't have an image, attempt to find a parent image instead.
      if (cubeEnabled && !member.image) {
        // const parentMember = await getParentMemberWithImage(db, member, meta);
        // if (parentMember) member.image = parentMember.image;
      }
      if (member.image && member.image.contentByLocale) {
        const content = member.image.contentByLocale.find(d => d.locale === locale);
        if (content) {
          member.image.meta = content.meta;
          delete member.image.contentByLocale;
        }
      }
      return res.json(member);
    }
    else {
      const {imageId} = member;
      if (["splash", "thumb"].includes(size)) {
        if (cubeEnabled && !imageId) {
          // const parentMember = await getParentMemberWithImage(db, member, meta);
          // if (parentMember) imageId = parentMember.imageId;
        }
        if (imageId) {
          // Check first to see if a blob is stored inside the psql row
          const imageRow = await db.image.findOne({where: {id: imageId}}).catch(() => false);
          console.log(imageRow);
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
