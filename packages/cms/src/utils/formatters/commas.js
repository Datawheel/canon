const libs = require("./libs");

/**
 * Rounds to nearest whole number and adds commas.
 */
function commas(n) {
  return libs.d3.format(",")(Math.round(n));
}   

module.exports = commas;
