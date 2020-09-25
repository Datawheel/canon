const yn = require("yn");
const formatters4eval = require("../formatters4eval");
const translateContent = require("./translateContent");
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
 * This method updates the translation in-place, so has no return value.
 */
const upsertTranslation = async(contentArray, db, ref, config, req) => {
  const {source, target} = config;
  const defCon = contentArray.find(c => c.locale === source);
  if (defCon) {
    const {id, locale, ...content} = defCon; //eslint-disable-line
    const translated = await translateContent(content, config, req);
    const newContent = {id, locale: target, ...translated};
    await db[ref].upsert(newContent, {where: {id, locale: target}}).catch(catcher);
  }
};

const translateSection = async(section, config, db, req) => {
  // Crawl through the object and translate each of its individual content rows, then update it in place
  await upsertTranslation(section.content, db, "section_content", config, req);
  for (const entityRef of ["subtitle", "description", "stat"]) {
    for (const entity of section[`${entityRef}s`]) {
      await upsertTranslation(entity.content, db, `section_${entityRef}_content`, config, req);
    }
  }
};

module.exports = {upsertTranslation, translateSection, fetchUpsertHelpers};
