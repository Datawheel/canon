const {formatAbbreviate} = require("d3plus-format");

/**
 * Abbreviates a number into a smaller more human-readible number.
 * https://github.com/d3plus/d3plus-format/blob/master/src/abbreviate.js#L44
 */
function abbreviate(n) {
  return formatAbbreviate(n);
}

module.exports = abbreviate;
