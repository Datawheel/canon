import varSwap from "./varSwap";

/* Given an object, a hashtable of formatting functions, and a lookup object full of variables
 * Replace every instance of {{var}} with its true value from the lookup object, and
 * apply the appropriate formatter
*/

const varSwapRecursive = (sourceObj, formatterFunctions, blockContext) => {
  const {variables} = blockContext;
  // todo1.0 this needs to use programmatic allowed
  const allowed = (obj) => (obj.allowed === "never"
    ? false
    : !obj.allowed || obj.allowed === "always" || variables[obj.allowed]
  );
  const obj = {...sourceObj};
  Object.keys(obj).forEach((skey) => {
    // If this property is a string, replace all the vars
    if (typeof obj[skey] === "string") {
      obj[skey] = varSwap(obj[skey], formatterFunctions, blockContext);
    } else if (Array.isArray(obj[skey])) {
      // If this property is an array, recursively swap all elements
      obj[skey] = obj[skey].filter(allowed).map((o) => {
        if (typeof o === "object") {
          return varSwapRecursive(o, formatterFunctions, blockContext);
        }
        // If this is a string, we've "hit bottom" and can swap it out with strSwap
        if (typeof o === "string") {
          return varSwap(o, formatterFunctions, blockContext);
        }
        return o;
      });
    } else if (typeof obj[skey] === "object" && obj[skey] !== null && !(obj[skey] instanceof Date)) {
      // If this property is an object, recursively do another swap
      // For some reason, postgres "DATE" props come through as objects. Exclude them from this object swap.
      obj[skey] = varSwapRecursive(obj[skey], formatterFunctions, blockContext);
    }
  });
  return obj;
};

export default varSwapRecursive;
