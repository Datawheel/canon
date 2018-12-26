/**
 * Pluralizes a word.
 */
function plural(n) {
  return n.replace(/\w$/g, chr => chr === "y" ? "ies" : `${chr}s`)
}

module.exports = plural;
