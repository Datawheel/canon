/**
* Converts html tags to spaces, then removes redundant spaces
*/
function stripHTML(n) {
  return String(n).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = stripHTML;
