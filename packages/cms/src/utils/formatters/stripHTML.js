/**
* Converts html tags to spaces, then removes redundant spaces
*/
function stripHTML(n) {
  return n.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = stripHTML;
