/**
 * Removes all paragraph tags from a string.
 */
function stripP(n) {
  return n.replace(/<p>/g, "").replace(/<\/p>/g, "");
}

module.exports = stripP;
