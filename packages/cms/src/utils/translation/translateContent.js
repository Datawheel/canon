const axios = require("axios");
const varSwapRecursive = require("../varSwapRecursive");
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);

const TRANSLATE_API = "/api/translate";

/**
 * To help translations, varswap in the currently selected member so the context makes sense
 * but preserve the original variable so it can be changed back. For example:
 * Welcome to {{nameOfCountry}} ====> Welcome to <c id="{{nameOfCountry}}" class="v">China</c>
 */
const spanify = (s, config) => {
  if (!s.length) return s;
  const {formatterFunctions, variables, allSelectors} = config;
  const vs = d => {
    try {
      // varSwapRecursive expects an object, so make an object with a "text" field. It also needs
      // a reference to allSelectors to be embedded into the object itself.
      const obj = {text: d, allSelectors};
      d = varSwapRecursive(obj, formatterFunctions, variables).text;
    }
    catch (e) {
      if (verbose) console.error(`Error in translation varswap: ${e}`);
    }
    return d;
  };
  // First, preserve all the {{variables}} and {{[[selectors]]}} by spanifying them
  const varmatch = /([A-z0-9]*(\{\{|\[\[)[\[\]\{\}A-z0-9\-]+(\}|\]))/g;
  const varspan = (match, g1) => `<c id="${g1}" class="v">${vs(g1)}</c>`;
  return s.replace(varmatch, varspan);
};

/**
 * When the translation returns, it is filled with custom spans (see spanify)
 * Turn these back into original variables and discard the member translations:
 * Beinvenudo a <c id="{{nameOfCountry}}" class="v">Chine</c> ====> Beinvenudo a {{nameOfCountry}}
 */
const varify = s => {
  if (!s.length) return s;
  return s
    // Replace the <c> spans with the {{vars}}. The translation API swallows a leading space, so add it back in.
    .replace(/\<c id=\"([A-z0-9]*(\{\{|\[\[)[\[\]\{\}A-z0-9\-]+(\}|\]))\" class\=\"v\"\>.*?\<\/c\>/g, " $1")
    // The translation API also ADDS a space after {{vars}} and before punctuation. Remove those.
    .replace(/(\}\}|\]\])(\s+)([\,\.\!])/g, "$1$3");
};

// Empty text fields in draftjs appear as p brackets - do not translate these.
const isEmpty = s => s === "<p><br></p>";

/**
 * Given a content object, translate all its keys. Google Translate API only works serverside,
 * but this function needs to be called client side (by textcard, for ad-hoc translations)
 * Therefore, give the server the ability to pass in a reference to the translationFunction,
 * but when that function is not provided, assume this is a client-side (or any other) request,
 * and use the TRANSLATE_API (which will ultimately invoke the same translationFunction)
 *
 * For future reference, the reason this is done this way is because webpack won't even compile
 * when the translate API is included client-side, so it can't be used here except by reference
 */
async function translateContent(obj, config, translationFunction) {
  if (!obj) return obj;
  const {source, target} = config;
  const keys = Object.keys(obj);
  const translated = {};
  let error = false;
  for (const key of keys) {
    if (obj[key] && typeof obj[key] === "string" && !isEmpty(obj[key])) {
      const text = spanify(obj[key], config);
      let resp;
      if (translationFunction) {
        resp = await translationFunction(text, source, target).catch(e => {
          if (!error) error = `translateContent: ${e.message}`;
          return false;
        });
      }
      else {
        const payload = {text, source, target};
        resp = await axios.post(TRANSLATE_API, payload).then(d => d.data).catch(e => {
          if (!error) error = `translateContent: ${e.message}`;
          return false;
        });
      }
      // if the catch returned false, don't mutate the key
      if (!resp) {
        translated[key] = obj[key];
      }
      else {
        // if the translation worked, turn it back into text
        if (resp && !resp.error) {
          translated[key] = varify(resp.translated);
        }
        // If for some reason the remote translation failed, bubble up
        // the remote error and don't mutate the key
        else {
          if (!error) error = resp.error;
          translated[key] = obj[key];
        }
      }
    }
    // do not mutate keys that are null or are empty
    else {
      translated[key] = obj[key];
    }
  }
  return {
    error,
    translated
  };
}

module.exports = translateContent;
