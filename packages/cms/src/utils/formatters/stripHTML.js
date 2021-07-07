// Internal list of HTML entities for escaping.
const entities = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#x27;": "'",
  "&#x60;": "`",
  "&nbsp;": ""
};

const source = `(?:${ Object.keys(entities).join("|")  })`;
const testRegexp = RegExp(source);
const replaceRegexp = RegExp(source, "g");

/**
* Converts html tags to spaces, then removes redundant spaces
*/
function stripHTML(n) {
  const s = String(n).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return testRegexp.test(s) ? s.replace(replaceRegexp, match => entities[match]) : s;
}

module.exports = stripHTML;
