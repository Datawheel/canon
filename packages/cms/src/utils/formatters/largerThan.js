/**
 *
 */
function largerThan(n) {    
  return n < 0 ? "smaller than" : n > 0 ? "larger than" : "the same as";
}

module.exports = largerThan;
