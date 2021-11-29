/**
 * Takes a camelCase or PascalCase string and adds spaces (I know Spaced Case isn't a thing, deal with it)
 */
function toSpacedCase(str) {

  // make sure this is a valid string and this makes sense
  if (typeof str === "string") {
    // grab uppercase characters, add a space before them, convert the whole thing to lowercase, and remove leading white space
    return str.replace(/([A-Z])/g, " $1").toLowerCase().trim();
  }

  // error handling
  return "invalid string passed to toSpacedCase()";
}

module.exports = toSpacedCase;
