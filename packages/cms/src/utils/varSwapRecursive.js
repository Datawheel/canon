const selSwap = require("./selSwap");
const varSwap = require("./varSwap");

/* Given an object, a hashtable of formatting functions, and a lookup object full of variables
 * Replace every instance of {{var}} with its true value from the lookup object, and
 * apply the appropriate formatter
*/

const extractSelectors = (selectors, formatterFunctions, variables, query) => 
  selectors.map(s => {
    const selector = {};
    // If the option provided in the query is one of the available options for this selector
    if (s.options.map(s => s.option).includes(query[s.name])) {
      // Save that option inside selector object and return it
      selector[s.name] = query[s.name];
      return selector;
    }
    // If the option is not provided by the query (or is incorrect) fall back on the default.
    // Note that defaults can be VARIABLES THEMSELVES if the user is using a custom default.
    // As such, run the default through the regular varSwap to get its true value.
    // TODO: When Custom Defaults are added for Multi-selects, this "default" fallback
    // will likely need to do extra magic because the default will be an array.
    else {
      // If the default is a string, then this is a traditional selector
      if (typeof s.default === "string") {
        selector[s.name] = varSwap(s.default, formatterFunctions, variables);  
      }
      // Otherwise its an array, and is a multi
      else {
        selector[s.name] = s.default.map(d => varSwap(d, formatterFunctions, variables)).join();
      }
      return selector;
    }
  });

const varSwapRecursive = (sourceObj, formatterFunctions, variables, query = {}, selectors = [], selectorsmulti = []) => {
  const allowed = obj => variables[obj.allowed] || obj.allowed === null || obj.allowed === undefined || obj.allowed === "always";
  const obj = Object.assign({}, sourceObj);
  // If I'm a topic and have selectors, extract and prep them for use
  // TODO: Consider combining these to a generalized selector, auto-detecting a multi
  if (obj.selectors) selectors = extractSelectors(obj.selectors, formatterFunctions, variables, query);
  if (obj.selectorsmulti) selectorsmulti = extractSelectors(obj.selectorsmulti, formatterFunctions, variables, query);  
  for (const skey in obj) {
    if (obj.hasOwnProperty(skey)) {
      // If this property is a string, replace all the vars
      if (typeof obj[skey] === "string") {
        // First, do a selector replace of the pattern [[Selector]]
        obj[skey] = selSwap(obj[skey], selectors);
        // Then, do a selector replace of the pattern [[Selector]] for all MULTI Selectors:
        obj[skey] = selSwap(obj[skey], selectorsmulti);
        // Replace all instances of the following pattern:  FormatterName{{VarToReplace}}
        obj[skey] = varSwap(obj[skey], formatterFunctions, variables);
      }
      // If this property is an array, recursively swap all elements
      else if (Array.isArray(obj[skey])) {
        obj[skey] = obj[skey].filter(allowed).map(o => varSwapRecursive(o, formatterFunctions, variables, query, selectors));
      }
      // If this property is an object, recursively do another swap
      else if (typeof obj[skey] === "object" && obj[skey] !== null) {
        obj[skey] = varSwapRecursive(obj[skey], formatterFunctions, variables, query, selectors);
      }
    }
  }
  return obj;
};

module.exports = varSwapRecursive;
