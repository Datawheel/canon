const PromiseThrottle = require("promise-throttle"),
      bubbleUpLocaleContent = require("../utils/blocks/bubbleUpLocaleContent"),
      collateQueryToDims = require("../utils/search/collateQueryToDims"),
      getFormattersFunctionsByLocale = require("../utils/reports/getFormattersFunctionsByLocale"),
      {fetchReportAndAttributesFromIdsOrSlugs} = require("../utils/search/searchHelpers"),
      libs = require("../utils/libs"), /*leave this! needed for the variable functions.*/ //eslint-disable-line
      runConsumers = require("../utils/blocks/runConsumers"),
      yn = require("yn");
const normalizeBlocks = require("../utils/blocks/normalizeBlocks");

const axiosConfig = require("../utils/canon/getAxiosConfig")();
const canonVars = require("../utils/canon/getCanonVars")(process.env);
const verbose = require("../utils/canon/getLogging")();

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
    // todo1.0 - set user and userRole as part of attributes
    // todo1.0 - fetch parents (legacy)
    // todo1.0 - show when printing
    const formatterFunctionsByLocale = await getFormattersFunctionsByLocale(db).catch(catcher);
    const formatterFunctions = formatterFunctionsByLocale[locale];
    
    const blocks = normalizeBlocks(report.sections.reduce((acc, d) => acc.concat(d.blocks), []));
    // todo1.0 - slug injections
    const sections = await Promise.all(report.sections.map(d => runConsumers(req, attributes, blocks, locale, formatterFunctions, d.id)));

    // todo1.0 - handle redirects for ids
    // todo1.0 - neighbors (legacy)
    // todo1.0 - images

    report.sections.forEach((section, i) => {
      section.blocks.forEach(block => {
        block = bubbleUpLocaleContent(block, locale);
        block.renderContent = sections[i].blocksById[block.id];
      });
    });

    return res.json(report);
  };

  app.get("/api/report", async(req, res) => await fetchReport(req, res));

};
