const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate();
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);

const catcher = e => {
  if (verbose) console.error("Error in translation: ", e);
  return false;
};

module.exports = function(app) {

  app.post("/api/translate", async(req, res) => {
    const {text, target} = req.body; 
    const resp = await translate.translate(text, target).catch(catcher);
    return resp && resp[0] ? res.json(resp[0]) : res.json("");
  });

  app.post("/api/translatetest", async(req, res) => {
    const {text, target} = req.body; 
    return res.json(`Would translate 7 ${target} ----> ${text}`);
  });
  
};
