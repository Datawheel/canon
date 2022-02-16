const PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      collateQueryToDims = require("../utils/search/collateQueryToDims"),
      getFormattersFunctionsByLocale = require("../utils/reports/getFormattersFunctionsByLocale"),
      {fetchReportAndAttributesFromIdsOrSlugs} = require("../utils/search/searchHelpers"),
      libs = require("../utils/libs"), /*leave this! needed for the variable functions.*/ //eslint-disable-line
      runConsumers = require("../utils/blocks/runConsumers"),
      sequelize = require("sequelize"),
      sorter = require("../utils/js/sorter"),
      varSwapRecursive = require("../utils/variables/varSwapRecursive"),
      yn = require("yn");
const getRootBlocksForSection = require("../utils/blocks/getRootBlocksForSection");
const normalizeBlocks = require("../utils/blocks/normalizeBlocks");

const getConfig = require("../utils/canon/getConfig");
const canonVars = require("../utils/canon/getCanonVars")(process.env);

const verbose = yn(process.env.CANON_REPORTS_LOGGING);
const localeDefault = canonVars.CANON_LANGUAGE_DEFAULT;

const catcher = e => {
  if (verbose) console.error("Error in reportRoute: ", e);
  return [];
};

const REQUESTS_PER_SECOND = process.env.CANON_REPORTS_REQUESTS_PER_SECOND ? parseInt(process.env.CANON_REPORTS_REQUESTS_PER_SECOND, 10) : 20;
const GENERATOR_TIMEOUT = process.env.CANON_REPORTS_GENERATOR_TIMEOUT ? parseInt(process.env.CANON_REPORTS_GENERATOR_TIMEOUT, 10) : 5000;

/*
todo1.0 how do you solve a cube like mariaaaa
let cubeRoot = process.env.CANON_REPORTS_CUBES || "localhost";
if (cubeRoot.substr(-1) === "/") cubeRoot = cubeRoot.substr(0, cubeRoot.length - 1);
*/

const throttle = new PromiseThrottle({
  requestsPerSecond: REQUESTS_PER_SECOND,
  promiseImplementation: Promise
});

module.exports = function(app) {

  const {cache, db} = app.settings;

  const fetchReport = async(req, res) => {
    const locale = req.query.locale || localeDefault;
    const dims = collateQueryToDims(req.query);
    const {report, attributes} = await fetchReportAndAttributesFromIdsOrSlugs(db, dims, locale);
    const formatterFunctionsByLocale = await getFormattersFunctionsByLocale(db).catch(catcher);
    const formatterFunctions = formatterFunctionsByLocale[locale];
    
    const blocks = normalizeBlocks(report.sections.reduce((acc, d) => acc.concat(d.blocks), []));
    const sections = await Promise.all(report.sections.map(d => {
      const rootBlocks = getRootBlocksForSection(d.id, blocks);
      return runConsumers(req, attributes, blocks, locale, formatterFunctions, rootBlocks);
    }));

    report.sections.forEach((section, i) => {
      section.blocks.forEach(block => {
        block.content = sections[i].blocksById[block.id];
      });
    });

    return res.json(report);
  };

  app.get("/api/report", async(req, res) => await fetchReport(req, res));

};
