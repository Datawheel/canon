/**
 * Takes a camelCase or PascalCase string and converts it to kebab-case
 */
function toKebabCase(str) {

  // make sure this is a valid string and this makes sense
  if (typeof str === "string") {
    // make sure the first character is lowercase
    str = str.charAt(0).toLowerCase() + str.substring(1);
    // grab uppercase characters, add a dash before them, and convert the whole thing to lowercase
    return str.replace(/([A-Z])/g, "-$1").toLowerCase();
  }

  // error handling
  return "invalid string passed to toKebabCase()";
}

module.exports = toKebabCase;
