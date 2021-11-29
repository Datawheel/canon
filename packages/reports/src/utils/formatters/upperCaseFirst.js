/**
* converts the first letter of a string to uppercase
*/
function upperCaseFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = upperCaseFirst;
