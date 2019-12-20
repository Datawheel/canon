/**
* converts the first letter of a string to lowercase
*/
function lowerCaseFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports = lowerCaseFirst;
