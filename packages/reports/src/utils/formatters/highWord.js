/**
 * Returns either "higher than", "lower than", or "approximately the same as" depending on the provided number's sign.
 */
function highWord(n) {  
  return n < 0 ? "lower than" : n > 0 ? "higher than" : "approximately the same as";
}

module.exports = highWord;
