const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate();
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);

/** 
 * The most basic wrapper for the google translate library. Used by /api/translate,
 * and also directly invoked by translateUtils.
 */
async function translateText(text, source, target) {
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
  return {
    error,
    translated
  };
}

module.exports = translateText;
