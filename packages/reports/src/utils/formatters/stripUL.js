/**
 * Removes unordered list wrapper tags from a string.
 */
function stripUL(n) {
  return n.replace(/<ul>/g, "").replace(/<\/ul>/g, "");
}

module.exports = stripUL;
