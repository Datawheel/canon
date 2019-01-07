/**
 *
 */
function increasedWord(n) {  
  return n < 0 ? "decreased" : n > 0 ? "increased" : "remained the same";
}

module.exports = increasedWord;
