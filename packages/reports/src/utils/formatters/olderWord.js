/**
 *
 */
function olderWord(n) {  
  return n < 0 ? "getting younger" : n > 0 ? "getting older" : "staying the same age";
}

module.exports = olderWord;
