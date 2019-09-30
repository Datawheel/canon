const libs = require("../libs");

/**
 * Abbreviates a number into a smaller more human-readible number.
 */
function abbreviate(n) {
  if (typeof n !== "number") return "N/A";

  const length = n.toString().split(".")[0].length;
  let val;

  if (n === 0) val = "0";
  else if (length >= 3) {
    const f = libs.d3.format(".3s")(n).replace("G", "B");
    const num = f.slice(0, -1);
    const char = f.slice(f.length - 1);
    val = `${parseFloat(num)}${char}`;
  }
  else if (length === 3) val = libs.d3.format(",f")(n);
  else val = libs.d3.format(".3g")(n);

  return val
    .replace(/(\.[0-9]*[1-9])[0]*$/g, "$1") /* removes any trailing zeros */
    .replace(/[.][0]*$/g, ""); /* removes any trailing decimal point */
}

module.exports = abbreviate;
