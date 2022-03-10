const axios = require("axios");
const {fetchMemberFromMemberIdOrSlug} = require("../utils/search/searchHelpers");
const getParentMemberWithImage = require("../utils/search/getParentMemberWithImage");

const {imageIncludeThumbOnly} = require("../utils/consts/cms");

const path = require("path");
const transparent = path.resolve("../packages/reports/static/images/transparent.png");

const validLicenses = ["4", "5", "7", "8", "9", "10"];
const validLicensesString = validLicenses.join();


const {axiosConfig, localeDefault, verbose, imageConfig} = require("../utils/canon/getCommonConfigs")();

let Base58, flickr, sharp;  //, storage;
if (imageConfig.flickrKey) {
  const Flickr = require("flickr-sdk");
  flickr = new Flickr(imageConfig.flickrKey);
  // const { Storage } = require("@google-cloud/storage");
  // storage = new Storage();
  sharp = require("sharp");
  Base58 = require("base58");
}

// todo1.0 remove/handle tesseract
let cubeRoot = process.env.CANON_CMS_CUBES || "localhost";
if (cubeRoot.substring(-1) === "/") cubeRoot = cubeRoot.substring(0, cubeRoot.length - 1);
const cubeEnabled = cubeRoot !== "localhost";

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

/**
 * Given a db connection, image id, and image buffer, attempt to upload the image to google cloud.
 * If the upload to cloud fails, store buffer data in psql row
 */
const uploadImage = async(db, id, imageData) => {
  const configs = [
    {type: "splash", res: imageConfig.splashWidth},
    {type: "thumb", res: imageConfig.thumbWidth}
  ];
  for (const config of configs) {
    const buffer = await sharp(imageData)
      .resize(config.res)
      .toFormat("jpeg")
      .jpeg({force: true})
      .toBuffer()
      .catch(catcher);
    
    
    /*  // todo1.0 add this back in for google 
    const file = `${config.type}/${id}.jpg`;
    const options = {metadata: {contentType: "image/jpeg"}};
    // Attempt to upload to google bucket. If it fails, fall back to psql blob
    const writeResult = await storage
      .bucket(bucket)
      .file(file)
      .save(buffer, options)
      .catch(e => {
        if (verbose) {
          console.warn(
            `Cloud upload error for ${file}, ${e.message}. If not using Cloud hosting, this safely be ignored.`
          );
        }
        return false;
      });

    */
    const writeResult = false;
    
    if (writeResult === false) {
      await db.image
        .update({[config.type]: buffer}, {where: {id}})
        .catch(catcher);
    } 
    else {
      // await storage.bucket(bucket).file(file).makePublic().catch(catcher);
    }
  }
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
          
          /*
          // todo1.0 add cloud back in 
          // Otherwise, try the cloud storage location. A failure here will return a 1x1 transparent png
          else if (bucket) {
            let url = `https://storage.googleapis.com/${bucket}/${size}/${imageId}.jpg`;
            if (t) url += `?t=${t}`;
            const imgData = await axios.get(url, {responseType: "arraybuffer"}).then(resp => resp.data).catch(imgCatcher);
            if (!imgData) return imageError();
            res.writeHead(200,  {"Content-Type": "image/jpeg"});
            return res.end(imgData, "binary");
          }
          */
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

  app.post("/api/newimage/update", async(req, res) => {
    if (!imageConfig.flickrKey) return res.json({error: "Flickr API Key not configured"});
    const {contentId} = req.body;
    let {id, shortid} = req.body;
    if (id && !shortid) shortid = Base58.int_to_base58(id);
    if (!id && shortid) id = Base58.base58_to_int(shortid);
    const url = `https://flic.kr/p/${shortid}`;
    const info = await flickr.photos
      .getInfo({photo_id: id})
      .then(resp => resp.body)
      .catch(catcher);
    if (info) {
      if (validLicenses.includes(info.photo.license)) {
        const searchRow = await db.search
          .findOne({where: {contentId}})
          .catch(catcher);
        const imageRow = await db.image
          .findOne({where: {url}})
          .catch(catcher);
        if (searchRow) {
          if (imageRow) {
            await db.search
              .update({imageId: imageRow.id}, {where: {contentId}})
              .catch(catcher);
          } 
          else {
            // To add a new image, first fetch the image data
            const sizeObj = await flickr.photos
              .getSizes({photo_id: id})
              .then(resp => resp.body)
              .catch(catcher);
            let image = sizeObj.sizes.size.find(
              d => parseInt(d.width, 10) >= 1600
            );
            if (!image) {
              image = sizeObj.sizes.size.find(
                d => parseInt(d.width, 10) >= 1000
              );
            }
            if (!image) {
              image = sizeObj.sizes.size.find(
                d => parseInt(d.width, 10) >= 500
              );
            }
            if (!image || !image.source) {
              return res.json({
                error: "Flickr Source Error, try another image."
              });
            }
            const imageData = await axios
              .get(image.source, {responseType: "arraybuffer"})
              .then(d => d.data)
              .catch(catcher);

            // Then add a row to the image table with the metadata.
            const payload = {
              url,
              author: info.photo.owner.realname || info.photo.owner.username,
              license: info.photo.license
            };
            const newImage = await db.image.create(payload).catch(catcher);
            await db.search
              .update({imageId: newImage.id}, {where: {contentId}})
              .catch(catcher);

            // Finally, upload splash and thumb version to google cloud, or psql as a fallback
            await uploadImage(db, newImage.id, imageData).catch(catcher);
          }
          const newRow = await db.search
            .findOne({
              where: {contentId},
              include: imageIncludeThumbOnly
            })
            .catch(catcher);
          if (newRow && newRow.image) {
            newRow.image.thumb = Boolean(newRow.image.thumb);
          }
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

};
