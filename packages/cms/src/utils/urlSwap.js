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
    // Remove the <> brackets from the edges
    const x = variable.slice(1, -1);
    // Create an array of accessor strings, e.g. parents[0].ids[3].name => ["parents", "0", "ids", "3", "name"]
    const accessors = x.match(/[^\]\[.]+/g);
    let value;
    try {
      value = accessors.reduce((o, i) => {
        // If the acccessor is a negative number, attempt a python-esque negative index access pattern
        const int = parseInt(i, 10);
        if (!isNaN(int) && int < 0) i = Math.abs((int + o.length) % o.length);
        return o[i];
      }, lookup);
    }
    catch (e) {
      if (verbose) console.error("Error in urlSwap: ", e.message);
    }
    if (value && typeof value !== "object") url = url.replace(variable, value);
  });

  return url;

};
