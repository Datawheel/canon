const varSwap = require("./varSwap");
const buble = require("buble");

const strSwap = (str, formatterFunctions, variables, isLogic = false, id = null) => {
  str = varSwap(str, formatterFunctions, variables);
  // If the key is named logic, this is javascript. Transpile it for IE.
  if (isLogic) {
    try {
      let code = buble.transform(str, {objectAssign: "Object.assign"}).code;
      if (code.startsWith("!")) code = code.slice(1);
      str = code;
    }
    catch (e) {
      console.error(`Error in ES5 transpiling in varSwapRecursive (ID: ${id})`);
      console.error(`Error message: ${e.message}`);
      // Note: There is no need to do anything special here. In Viz/index.jsx, we will eventually run propify.
      // Propify handles malformed js and sets an error instead of attempting to render the viz, so we can simply
      // leave the key as malformed es6, let propify catch it later, and pass the error to the front-end.
    }
  }
  return str;
};

/* Given an object, a hashtable of formatting functions, and a lookup object full of variables
 * Replace every instance of {{var}} with its true value from the lookup object, and
 * apply the appropriate formatter
*/

const varSwapRecursive = (sourceObj, formatterFunctions, variables, query = {}) => {
  const allowed = obj => !obj.allowed || obj.allowed === "always" || variables[obj.allowed];
  const obj = {...sourceObj};
  for (const skey in obj) {
    if (obj.hasOwnProperty(skey)) {
      // If this property is a string, replace all the vars
      if (typeof obj[skey] === "string") {
        obj[skey] = strSwap(obj[skey], formatterFunctions, variables, skey === "logic", obj.id);
      }
      // If this property is an array, recursively swap all elements
      else if (Array.isArray(obj[skey])) {
        obj[skey] = obj[skey].filter(allowed).map(o => {
          if (typeof o === "object") {
            return varSwapRecursive(o, formatterFunctions, variables, query);
          }
          // If this is a string, we've "hit bottom" and can swap it out with strSwap
          else if (typeof o === "string") {
            return strSwap(o, formatterFunctions, variables);
          }
          else {
            return o;
          }
        });
      }
      // If this property is an object, recursively do another swap
      // For some reason, postgres "DATE" props come through as objects. Exclude them from this object swap.
      else if (typeof obj[skey] === "object" && obj[skey] !== null && !(obj[skey] instanceof Date)) {
        obj[skey] = varSwapRecursive(obj[skey], formatterFunctions, variables, query);
      }
    }
  }
  return obj;
};

module.exports = varSwapRecursive;
