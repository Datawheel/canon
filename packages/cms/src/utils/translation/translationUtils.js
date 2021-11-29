const yn = require("yn");
const formatters4eval = require("../formatters4eval");
const translateContent = require("./translateContent");
const translateText = require("./translateText");
const {profileReqFull} = require("../sequelize/models");
const verbose = yn(process.env.CANON_CMS_LOGGING);

const catcher = e => {
  if (verbose) {
    console.error("Error in translationUtils: ", e.message);
  }
  return {};
};

/**
 * The config objects for the methods below require formatters and selectors for the ensuing
 * varSwapRecursive in translateContent. Export a function so external invokers can easily get these
 */ 
const fetchUpsertHelpers = async(db, pid, source) => {
  const formatterFunctions = await formatters4eval(db, source);
  let allSelectors = await db.selector.findAll({where: {profile_id: pid}}).catch(catcher);
  allSelectors = allSelectors.map(d => d.toJSON());
  return {formatterFunctions, allSelectors};
};

/**
 * - contentArray of a cms entity
 * - sequelize db and string table ref to process the upsert 
 * - config object with source, target, variables, formatterFunctions and allSelectors
 * - req, to pass through to translateContent, so the API can determine path with origin/host
 * This method updates the translation in-place, returning any errors (or false if successful)
 */
const upsertTranslation = async(contentArray, db, ref, config) => {
  const {source, target} = config;
  const defCon = contentArray.find(c => c.locale === source);
  if (defCon) {
    const {id, locale, ...content} = defCon; //eslint-disable-line
    let error = false;
    const resp = await translateContent(content, config, translateText).catch(e => {
      if (verbose) console.log("Error in upsertTranslation:", e);
      error = `upsertTranslation: ${e.message}`;
    });
    if (error) {
      return error;
    }
    else {
      if (resp.error) {
        return resp.error;
      }
      else {
        const {translated} = resp;
        const newContent = {id, locale: target, ...translated};
        await db[ref].upsert(newContent, {where: {id, locale: target}}).catch(catcher);
        return false;
      }
    }
  }
  else {
    return "upsertTranslation error: No source content";
  }
};

/** 
 * translateProfile is used both by translateRoute and the npx translation script
 */
const translateProfile = async(db, pid, config) => {
  const {source} = config;
  const helpers = await fetchUpsertHelpers(db, pid, source);
  const combinedConfig = {...config, ...helpers};
  const reqObj = Object.assign({}, profileReqFull, {where: {id: pid}});
  let profile = await db.profile.findOne(reqObj);
  profile = profile.toJSON();
  const error = await upsertTranslation(profile.content, db, "profile_content", combinedConfig);
  if (error) return error;
  for (const section of profile.sections) {
    await translateSection(db, section, combinedConfig);
  }
  return false;
};

/**
 * translateSection may be called by translateRoute route as one-off, or it may be invoked
 * many times by translateProfile (above). Therefore translate section receives a fully-qualified
 * section object (not an id) to avoid doing a ton of db gets (profiles can just pass sections)
 */
const translateSection = async(db, section, config) => {
  // Crawl through the object and translate each of its individual content rows, then update it in place
  const error = await upsertTranslation(section.content, db, "section_content", config);
  if (error) return error;
  for (const entityRef of ["subtitle", "description", "stat"]) {
    for (const entity of section[`${entityRef}s`]) {
      await upsertTranslation(entity.content, db, `section_${entityRef}_content`, config);
    }
  }
  return false;
};

module.exports = {upsertTranslation, translateProfile, translateSection, fetchUpsertHelpers};
