/**
 * Returns either "growth" or "decline" depending on the provided number's sign.
 */
function growthWord(n) {
  return n < 0 ? "decline" : "growth";
}

module.exports = growthWord;
