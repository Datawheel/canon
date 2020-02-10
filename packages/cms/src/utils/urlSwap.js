const yn = require("yn");

const {CANON_LOGICLAYER_CUBE} = process.env;

const env = {
  CANON_LOGICLAYER_CUBE
};

const verbose = yn(process.env.CANON_CMS_LOGGING);

module.exports = function(url, params) {

  if (typeof url !== "string") return url;

  const lookup = Object.assign({}, env, params);

  (url.match(/<[^\&\=\/>]+>/g) || []).forEach(variable => {
    const x = variable.slice(1, -1);
    const accessors = x.match(/[^\]\[.]+/g);
    let value;
    try {
      value = accessors.reduce((o, i) => o[i], lookup);
    }
    catch (e) {
      if (verbose) console.error("Error in urlSwap: ", e.message);
    }
    if (value && typeof value !== "object") url = url.replace(variable, value);
  });

  return url;

};
