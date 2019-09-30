const libs = require("../libs");

/**
 * Formats a date into "%B %d, %Y" format.
 */
function date(n) {
  if (typeof n === "string") n = libs.d3plus.date(n);
  return libs.d3.timeFormat("%B %d, %Y")(n);
}

module.exports = date;
