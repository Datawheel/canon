/**
 * Takes a pixel value and converts it to an integer
 */
function pxToInt(str) {
  return parseInt(str.replace(/\D+/g, ""), 10);
}

module.exports = pxToInt;
