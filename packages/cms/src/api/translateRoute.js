const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate();
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);
const {isAuthenticated} = require("../utils/api");
// const isAuthenticated = (req, res, next) => next();  // Bypass login, for Testing Only!!

const enableTranslation = process.env.NODE_ENV === "development" || yn(process.env.CANON_CMS_ENABLE);

module.exports = function(app) {

  if (enableTranslation) {
    app.post("/api/translate", isAuthenticated, async(req, res) => {
      const {text, source, target} = req.body;
      let error = false;
      const options = {
        from: source,
        to: target
      };
      const resp = await translate.translate(text, options).catch(e => {
        if (verbose) console.error("Error in translation: ", e);
        if (!error) error = `translateRoute: ${e.message}`;
        return false;
      });
      const translated = resp && resp[0] ? resp[0] : text;
      return res.json({
        error,
        translated
      });
    });

    app.post("/api/translatetest", isAuthenticated, async(req, res) => {
      const {text, source, target} = req.body; 
      return res.json({
        error: false,
        translated: `Would translate from ${source} to ${target} ----> ${text}`
      });
    });
  }
  
};
