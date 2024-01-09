const {strip} = require("d3plus-text");

/**
 * Sanitizes search query inputs for comparison against user queries.
 * @param {*} str
 */
function sanitizeQuery(str) {
  if (!str) return "";
  return strip(str.toLowerCase(), " ") // removes non Latin and Arabic characters and replaces diacritics
    .replace(/\s\s+/g, " "); // reduces multiple concurrent spaces to a single space
}

module.exports = sanitizeQuery;
