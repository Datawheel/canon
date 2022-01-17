const yn = require("yn");
const {isAuthenticated} = require("../utils/api");
// const isAuthenticated = (req, res, next) => next();  // Bypass login, for Testing Only!!
const translateText = require("../utils/translation/translateText");

const enableTranslation = process.env.NODE_ENV === "development" || yn(process.env.CANON_CMS_ENABLE);

module.exports = function(app) {

  if (enableTranslation) {
    app.post("/api/translate", isAuthenticated, async(req, res) => {
      const {text, source, target} = req.body;
      const result = await translateText(text, source, target);
      return res.json(result);
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
