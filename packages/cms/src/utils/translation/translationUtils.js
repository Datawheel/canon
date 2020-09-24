const yn = require("yn");
const formatters4eval = require("../formatters4eval");
const translateContent = require("./translateContent");
const {sectionReqFull} = require("../sequelize/models");
const verbose = yn(process.env.CANON_CMS_LOGGING);

const catcher = e => {
  if (verbose) {
    console.error("Error in translationUtils: ", e.message);
  }
  return {};
};

/**
 * - contentArray of a cms entity
 * - db ref to process the upsert 
 * - config object with source, target, and variables
 * - req, to pass through to translateContent, so the API can path with origin/host
 * It updates the translation in-place, so has no return value.
 */
const upsertTranslation = async(contentArray, db, ref, config, req) => {
  const {source, target, variables} = config;
  const defCon = contentArray.find(c => c.locale === source);
  if (defCon) {
    const formatterFunctions = await formatters4eval(db, source);
    const {id, locale, ...content} = defCon; //eslint-disable-line
    const translated = await translateContent(content, source, target, {variables, formatterFunctions}, req);
    const newContent = {id, locale: target, ...translated};
    await db[ref].upsert(newContent, {where: {id, locale: target}}).catch(catcher);
  }
};

const translateSection = async(sid, config, db, req) => {
  // Fetch the full section by the provided id, including content
  const reqObj = Object.assign({}, sectionReqFull, {where: {id: sid}});
  let section = await db.section.findOne(reqObj);
  section = section.toJSON();
  // Crawl through the object and translate each of its individual content rows, then update it in place
  await upsertTranslation(section.content, db, "section_content", config, req);
  for (const entityRef of ["subtitle", "description", "stat"]) {
    for (const entity of section[`${entityRef}s`]) {
      await upsertTranslation(entity.content, db, `section_${entityRef}_content`, config, req);
    }
  }
};

module.exports = {upsertTranslation, translateSection};
