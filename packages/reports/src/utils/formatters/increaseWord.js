/**
 * Returns either "increase", "decrease", or "change" depending on the provided number's sign.
 */
function increaseWord(n) {
  return n < 0 ? "decrease" : n > 0 ? "increase" : "change";
}

module.exports = increaseWord;
