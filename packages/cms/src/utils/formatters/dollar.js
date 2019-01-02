/* global formatters */

/**
 * Adds a US dollar sign to the beginning of a String or Number.
 */
function dollar(n) {
  if (typeof n === "number") n = formatters.abbreviate(n);       
  return n.charAt(0) === "-" ? n.replace("-", "-$") : `$${n}`;
}

module.exports = dollar;
