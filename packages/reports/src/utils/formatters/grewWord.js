/**
 * Returns either "grew", "declined", or "stayed" depending on the provided number's sign.
 */
function grewWord(n) {  
  return n < 0 ? "declined" : n > 0 ? "grew" : "stayed";
}

module.exports = grewWord;
