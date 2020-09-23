const axios = require("axios");
const varSwap = require("./varSwap");
const yn = require("yn");
const verbose = yn(process.env.CANON_CMS_LOGGING);

const TRANSLATE_API = "/api/translate";

const catcher = e => {
  if (verbose) console.log(`Error in content transation: ${e}`);
  return false;
};

const spanify = (s, vsConfig) => {
  if (!s.length) return s;
  const {variables, formatterFunctions} = vsConfig;
  const vs = d => varSwap(d, formatterFunctions, variables);
  const template = (match, g1) => `<canonspan id="${g1}" class="variable">${vs(g1)}</canonspan>`;
  return s.replace(/([A-z0-9]*\{\{[^\}]+\}\})/g, template);
};

const varify = s => {
  if (!s.length) return s;
  return s.replace(/\<canonspan id=\"([A-z0-9]*\{\{[^\}]+\}\})\" class\=\"variable\"\>.*?\<\/canonspan\>/g, "$1");
};

/** */
async function translate(obj, source, target, vsConfig, req = false) {
  if (!obj) return obj;
  // req is for server-side requests, client side is fine to use the relative path
  const api = req ? `${req.protocol}://${req.headers.host}${TRANSLATE_API}` : TRANSLATE_API;
  const keys = Object.keys(obj);
  const translated = {};
  for (const key of keys) {
    if (obj[key]) {
      const text = spanify(obj[key], vsConfig);
      const payload = {text, target};
      const resp = await axios.post(api, payload).catch(catcher);
      if (resp && resp.data) {
        translated[key] = varify(resp.data);
      }
      else translated[key] = obj[key];
    }
    else {
      translated[key] = obj[key];
    }
  }
  return translated;
}

module.exports = translate;
