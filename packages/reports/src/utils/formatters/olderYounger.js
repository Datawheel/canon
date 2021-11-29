/**
 *
 */
function olderYounger(n) {   
  return n < 0 ? "younger than" : n > 0 ? "older than" : "the same age as";
}

module.exports = olderYounger;
