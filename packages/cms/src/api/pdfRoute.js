const puppeteer = require("puppeteer");
const {assign} = require("d3plus-common");
const {
  CANON_CMS_HTACCESS_USER,
  CANON_CMS_HTACCESS_PW
} = process.env;
const path = require("path");
const canonConfigPath = path.resolve("canon.js");
const canon = require(canonConfigPath);
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";
const LANGUAGES = process.env.CANON_LANGUAGES ? process.env.CANON_LANGUAGES.split(",") : [envLoc];
if (!LANGUAGES.includes(envLoc)) LANGUAGES.push(envLoc);
const disable = yn(process.env.CANON_CMS_PDF_DISABLE);

const catcher = e => {
  console.error("Error in pdfRoute: ", e);
  return false;
};

const style = `
<style>
  .container {
    color: #444;
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 7px;
    text-align: center;
    width: 100%;
  }
  .pageNumber,
  .totalPages,
  .title {
    font-size: 7px;
  }
  .url {
    font-size: 5px;
  }
</style>
`;

const defaultOptions = {
  displayHeaderFooter: true,
  footerTemplate: `
${style}
<div class="container">
  <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>`,
  headerTemplate: `
${style}
<div class="container">
  <div class="title"></div>
  <div class="url"></div>
</div>`,
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  printBackground: true
};

const generate = async(path, userOptions = {}, viewportOptions = {}, pageOptions = {timeout: 0}) => {

  const width = 1200;
  const height = Math.round(width / 8.5 * 11);

  const browser = await puppeteer.launch({
    args: [
      `--window-size=${width},${height}`,
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ],
    defaultViewport: assign({width, height}, viewportOptions),
    headless: true,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();

  if (CANON_CMS_HTACCESS_USER && CANON_CMS_HTACCESS_PW) {
    await page.authenticate({username: CANON_CMS_HTACCESS_USER, password: CANON_CMS_HTACCESS_PW});
  }
  await page.goto(path, {waitUntil: "networkidle2", ...pageOptions});
  const pdf = await page.pdf(assign({width, height}, defaultOptions, userOptions));

  await browser.close();

  return pdf;
};

/**
 * Without access to routes.jsx, the custom URL pattern for a profile can't be divined.
 * Make a best guess here using the recommended pathing from the documentation
 */
const verify = async(db, path) => {
  if (!path) return false;
  path = path.split("?")[0];
  const params = path
    .split("/")
    .filter(d =>
      !LANGUAGES.includes(d) &&  // strip out language code
      !d.startsWith("?") &&      // strip out query params
      d !== "profile");          // "profile" is the standard route identifier
  if (!params) return false;
  // Try to discern the profile
  let pid;
  // It's most likely that the first slug is the first param, try that first. Because all profile slugs are unique,
  // Finding just the first one (slug1) is sufficient for gaining the entire profile
  const meta = await db.profile_meta.findOne({where: {slug: params[0]}}).catch(catcher);
  if (meta) {
    pid = meta.profile_id;
  }
  // Otherwise, try all the params, searching for a match
  else {
    const meta = await db.profile_meta.findOne({where: {slug: params}}).catch(catcher);
    if (meta) pid = meta.profile_id;
  }
  // If no profile was found, eject
  if (!pid) return false;
  // Get all profile-slugs associated with this profile
  const allMeta = await db.profile_meta.findAll({where: {profile_id: pid}}).catch(catcher);
  if (!allMeta) return false;
  for (const meta of allMeta) {
    const {slug, dimension, levels, cubeName} = meta;
    const slugLoc = params.indexOf(slug);
    if (slugLoc === -1) return false;
    // Assume, at the very least, that the member for a given profile immediately follows it in the path
    const member = params[slugLoc + 1];
    const check = await db.search.findOne({where: {slug: member, dimension, hierarchy: levels, cubeName}}).catch(catcher);
    if (!check) return false;
  }
  return true;
};

module.exports = function(app) {

  if (!disable) {

    const {db} = app.settings;

    app.post("/api/pdf", async(req, res) => {
      const valid = await verify(db, req.body.path);
      if (!valid) return res.json({error: "Error in pdfRoute: Invalid path"});
      res.connection.setTimeout(1000 * 60 * 5);
      const path = `${req.protocol}://${req.headers.host}/${req.body.path}`;
      const pdf = await generate(path, req.body.pdfOptions, req.body.viewportOptions, req.body.pageOptions);
      res.set({"Content-Type": "application/pdf", "Content-Length": pdf.length});
      return res.send(pdf);
    });

    app.get("/api/pdf/get", async(req, res) => {
      const valid = await verify(db, req.query.path);
      if (!valid) return res.json({error: "Error in pdfRoute: Invalid path"});
      const path = `${req.protocol}://${req.headers.host}/${req.query.path}`;
      if (verbose && (!canon.pdf || !canon.pdf.pdfOptions || !canon.pdf.viewportOptions)) {
        console.warn("Warning: PDF generation options not configured in canon.js");
      }
      const pdfOptions = canon.pdf && canon.pdf.pdfOptions ? canon.pdf.pdfOptions : {};
      const viewportOptions = canon.pdf && canon.pdf.viewportOptions ? canon.pdf.viewportOptions : {};
      const pageOptions = canon.pdf && canon.pdf.pageOptions ? canon.pdf.pageOptions : {};
      const pdf = await generate(path, pdfOptions, viewportOptions, pageOptions);
      return res.send(pdf);
    });
  }

};
