const axios = require("axios");
const varSwapRecursive = require("../varSwapRecursive");
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);

const TRANSLATE_API = "/api/translate";

const catcher = e => {
  if (verbose) console.error(`Error in content transation: ${e}`);
  return false;
};

// sourceObj, formatterFunctions, variables, query = {}, selectors = [], combinedLabels = {}

/** 
 * To help translations, varswap in the currently selected member so the context makes sense
 * but preserve the original variable so it can be changed back. For example:
 * Welcome to {{nameOfCountry}} ====> Welcome to <c id="{{nameOfCountry}}" class="v">China</c>
 */
const spanify = (s, vsConfig) => {
  if (!s.length) return s;
  const {formatterFunctions, variables, allSelectors} = vsConfig;
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
  return s.replace(/\<c id=\"([A-z0-9]*(\{\{|\[\[)[\[\]\{\}A-z0-9\-]+(\}|\]))\" class\=\"v\"\>.*?\<\/c\>/g, " $1");
};

// Empty text fields in draftjs appear as p brackets - do not translate these.
const isEmpty = s => s === "<p><br></p>";

/** */
async function translateContent(obj, source, target, vsConfig, req = false) {
  if (!obj) return obj;
  // req is for server-side requests, client side is fine to use the relative path
  const api = req ? `${req.protocol}://${req.headers.host}${TRANSLATE_API}` : TRANSLATE_API;
  const keys = Object.keys(obj);
  const translated = {};
  for (const key of keys) {
    if (obj[key] && !isEmpty(obj[key])) {
      const text = spanify(obj[key], vsConfig);
      const payload = {text, target};
      const resp = await axios.post(api, payload).catch(catcher);
      if (resp && resp.data) {
        translated[key] = varify(resp.data);
      }
      // todo: return error code to user here
      else translated[key] = obj[key];
    }
    else {
      translated[key] = obj[key];
    }
  }
  return translated;
}

module.exports = translateContent;
