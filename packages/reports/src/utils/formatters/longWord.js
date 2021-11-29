/**
 *
 */
function longWord(n) {    
  return n < 0 ? "shorter" : n > 0 ? "longer" : "similar";
}

module.exports = longWord;
