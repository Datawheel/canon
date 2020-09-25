const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate();
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);
// const {isAuthenticated} = require("../utils/api");
const isAuthenticated = (req, res, next) => next();  // REMOVE THIS
  
const catcher = e => {
  if (verbose) console.error("Error in translation: ", e);
  return false;
};

const enableTranslation = process.env.NODE_ENV === "development" || yn(process.env.CANON_CMS_ENABLE);

module.exports = function(app) {

  if (enableTranslation) {
    app.post("/api/translate", isAuthenticated, async(req, res) => {
      const {text, source, target} = req.body;
      const options = {
        from: source,
        to: target
      };
      const resp = await translate.translate(text, options).catch(catcher);
      return resp && resp[0] ? res.json(resp[0]) : res.json("");
    });

    app.post("/api/translatetest", isAuthenticated, async(req, res) => {
      const {text, source, target} = req.body; 
      return res.json(`Would translate 10 from ${source} to ${target} ----> ${text}`);
    });
  }
  
};
