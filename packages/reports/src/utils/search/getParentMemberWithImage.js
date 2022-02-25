const axios = require("axios");

const {imageIncludeNoBlobs} = require("../consts/cms.js");

// todo1.0 remove/handle tesseract
let cubeRoot = process.env.CANON_CMS_CUBES || "localhost";
if (cubeRoot.substring(-1) === "/") cubeRoot = cubeRoot.substring(0, cubeRoot.length - 1);

const {verbose, axiosConfig} = require("../canon/getCommonConfigs")();

const catcher = e => {
  if (verbose) console.log("error in getParentMemberWithImage", e);
  return false;
};

// todo1.0 update this for 1.0

module.exports = async(db, member, meta) => {
  const {id, hierarchy} = member;
  const {dimension, cubeName} = meta;
  if (cubeName) {
    const url = `${cubeRoot}/relations.jsonrecords?cube=${cubeName}&${hierarchy}=${id}:parents`;
    const resp = await axios.get(url, axiosConfig).catch(() => {
      if (verbose) console.log("Warning: Parent endpoint misconfigured or not available (imageRoute)");
      return [];
    });
    if (resp.data && resp.data.data && resp.data.data.length > 0) {
      const parents = resp.data.data.reverse();
      for (const parent of parents) {
        let parentMember = await db.search.findOne({
          where: {dimension, id: parent.value, cubeName},
          include: imageIncludeNoBlobs
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
