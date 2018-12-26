/**
 * Removes all HTML tags from a string.
 */
function stripHTML(n) {
  return n.replace(/<[^>]+>/g, "");
}

module.exports = stripHTML;
