/**
 *
 */
function grewTo(n) {   
  return n < 0 ? "declined from" : n > 0 ? "grew to" : "stayed at";
}

module.exports = grewTo;
