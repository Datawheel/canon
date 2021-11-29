/**
 * Returns either "more than", "less than", or "approximately the same" depending on the provided number's sign.
 */
function moreWord(n) { 
  return n < 0 ? "less than" : n > 0 ? "more than" : "approximately the same";
}

module.exports = moreWord;
