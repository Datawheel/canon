/**
* Removes non breaking spaces & other html entities from a string
*/
function stripEntities(n) {
  return typeof n === "string" ? String(n).replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/ig, " ") : n;
}

module.exports = stripEntities;
