const yn = require("yn");
const formatters4eval = require("../formatters4eval");
const translateContent = require("./translateContent");
const translateText = require("./translateText");
const {reportReqFull} = require("../sequelize/ormHelpers");
const verbose = yn(process.env.CANON_REPORTS_LOGGING);

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
  const formatters = await db.formatter.findAll().catch(() => []);
  const formatterFunctions = await formatters4eval(formatters, source);
  // todo1.0 selectors will come from a different place
  let allSelectors = await db.selector.findAll({where: {report_id: pid}}).catch(catcher);
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
 * translateReport is used both by translateRoute and the npx translation script
 */
const translateReport = async(db, pid, config) => {
  const {source} = config;
  const helpers = await fetchUpsertHelpers(db, pid, source);
  const combinedConfig = {...config, ...helpers};
  const reqObj = Object.assign({}, reportReqFull, {where: {id: pid}});
  let report = await db.report.findOne(reqObj);
  report = report.toJSON();
  const error = await upsertTranslation(report.content, db, "report_content", combinedConfig);
  if (error) return error;
  for (const section of report.sections) {
    await translateSection(db, section, combinedConfig);
  }
  return false;
};

/**
 * translateSection may be called by translateRoute route as one-off, or it may be invoked
 * many times by translateReport (above). Therefore translate section receives a fully-qualified
 * section object (not an id) to avoid doing a ton of db gets (reports can just pass sections)
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

module.exports = {upsertTranslation, translateReport, translateSection, fetchUpsertHelpers};
