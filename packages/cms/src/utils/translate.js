const varSwap = require("./varSwap");
const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate();

// const translate = d => d;

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
async function doTranslate(obj, source, target, vsConfig) {
  const keys = Object.keys(obj);  
  const translated = {};
  for (const key of keys) {
    if (obj[key]) {
      const text = spanify(obj[key], vsConfig);
      const resp = await translate.translate(text, target);
      if (resp && resp[0]) {
        translated[key] = varify(resp[0]);
      }
      else translated[key] = obj[key];
    }
    else {
      translated[key] = obj[key];
    }
  }
  return translated;
}

module.exports = doTranslate;
