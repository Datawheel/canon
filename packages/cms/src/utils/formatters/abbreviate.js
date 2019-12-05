const libs = require("../libs");

/**
 * Abbreviates a number into a smaller more human-readible number.
 * https://github.com/d3plus/d3plus-format/blob/master/src/abbreviate.js#L44
 */
function abbreviate(n) {
  return libs.d3plus.formatAbbreviate(n);
}
module.exports = abbreviate;
