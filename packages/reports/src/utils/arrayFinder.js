/**
 * Given an object, crawls down keys recursively looking for arrays. Returns a list of
 * string accessors, separated by dots if nested, e.g., "data.payload.results"
 */
const arrayFinder = obj => {
  const keys = [];
  const parse = (obj, prefix = "") => {
    if (typeof obj !== "object") return;
    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        keys.push(`${prefix ? `${prefix}.` : ""}${key}`);
      }
      else if (typeof obj[key] === "object") {
        parse(obj[key], `${prefix ? `${prefix}.` : ""}${key}`);
      }
      else return;
    });
  };
  parse(obj);
  return keys;
};

const keyDiver = (obj, str) => typeof str === "string" ? str.split(".").reduce((o, i) => o[i], obj) : obj;

module.exports = {arrayFinder, keyDiver};
