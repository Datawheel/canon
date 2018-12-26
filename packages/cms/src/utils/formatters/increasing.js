/**
 *
 */
function increasing(n) {   
  return n < 0 ? "decreasing" : n > 0 ? "increasing" : "maintaining";
}

module.exports = increasing;
