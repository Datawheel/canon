/**
* converts the first letter of a string to lowercase
*/
function lowerCaseFirst(n) {
  return typeof n === "string" ? n.charAt(0).toLowerCase() + n.slice(1) : n;
}

module.exports = lowerCaseFirst;
