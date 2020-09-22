const axios = require("axios");
const varSwap = require("./varSwap");

const TRANSLATE_API = "/api/translate";

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
async function translate(obj, source, target, vsConfig) {
  if (!obj) return obj;
  const keys = Object.keys(obj);
  const translated = {};
  for (const key of keys) {
    if (obj[key]) {
      const text = spanify(obj[key], vsConfig);
      const payload = {text, target};
      const resp = await axios.post(TRANSLATE_API, payload);
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
