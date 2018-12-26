/**
 * Joins an array of strings together, adding commas and "and" when necessary.
 */
function list(n) {
  return n.reduce((str, item, i) => {   
    if (!i) str += item;   
    else if (i === n.length - 1 && i === 1) str += ` and ${item}`;   
    else if (i === n.length - 1) str += `, and ${item}`;   
    else str += `, ${item}`;   
    return str; 
  }, "");
}

module.exports = list;
