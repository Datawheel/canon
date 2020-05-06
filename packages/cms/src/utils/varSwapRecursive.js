const selSwap = require("./selSwap");
const varSwap = require("./varSwap");
const buble = require("buble");
const validateDynamic = require("./selectors/validateDynamic");
const scaffoldDynamic = require("./selectors/scaffoldDynamic");

const strSwap = (str, formatterFunctions, variables, selectors, isLogic = false, id = null) => {
  // First, do a selector replace of the pattern [[Selector]]
  str = selSwap(str, selectors);
  // After doing selSwap, there may be examples of {{variables}} that don't actually exist, because they came
  // from a dynamic selector. Perform an intermediate step using the _labels lookup object to help varSwap do its job
  const combinedLabels = selectors.reduce((acc, d) => ({...acc, ...d._labels}), {});
  str = varSwap(str, formatterFunctions, combinedLabels, true);
  // Now that [[selectors]] have been swapped in, and potentially missing dynamic selector variables have been "labeled",
  // do the standard varSwap: Replace all instances of the following pattern:  FormatterName{{VarToReplace}}
  str = varSwap(str, formatterFunctions, variables);
  // If the key is named logic, this is javascript. Transpile it for IE.
  if (isLogic) {
    try {
      let code = buble.transform(str).code; 
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
  
const varSwapRecursive = (sourceObj, formatterFunctions, variables, query = {}, selectors = []) => {
  const allowed = obj => !obj.allowed || obj.allowed === "always" || variables[selSwap(obj.allowed, selectors)];
  const obj = Object.assign({}, sourceObj);
  // If allSelectors is loaded into the top-level object, extract and prep them for use. This means iterating over 
  // every selector, checking if the provided query is giving us selections, and otherwise falling 
  // back on the value of the default. This creates an array of objects that looks like: 
  // [{year-select: "year2012"}, {state-select: "state25,state36"}, {degree-select: "phd"}]
  // some from query, some from default, but either way, prepped for selSwap.
  if (obj.allSelectors) {
    selectors = obj.allSelectors.map(s => {
      const selector = {};
      // If the option provided in the query is one of the available options for this selector
      const selections = query[s.name] ? query[s.name].split(",") : false;
      let options = [];
      if (s.dynamic) {
        // Dynamic selectors don't actually have options, only a dynamic field that points to a variable.
        // Scaffold them out to behave as if they were static options. That said, because the options within
        // dynamic selectors "don't exist" as normal variables, we need a lookup object for the labels for selSwap
        if (validateDynamic(variables[s.dynamic]) === "valid") {
          options = scaffoldDynamic(variables[s.dynamic]);
          selector._labels = options.reduce((acc, d) => ({...acc, [d.option]: d.label || d.option}), {});
        }
      }
      else {
        options = s.options;
      }
      if (selections && selections.every(sel => options.map(o => o.option).includes(sel))) {
        // Save that option inside selector object and return it
        selector[s.name] = query[s.name];
        return selector;
      }
      // If the option is not provided by the query (or is incorrect) fall back on the default.
      // Note that defaults can be VARIABLES THEMSELVES if the user is using a custom default.
      // As such, run the default through the regular varSwap to get its true value.
      else {
        selector[s.name] = varSwap(s.default, formatterFunctions, variables);  
        return selector;
      }
    });
  }

  for (const skey in obj) {
    if (obj.hasOwnProperty(skey)) {
      // If this property is a string, replace all the vars
      if (typeof obj[skey] === "string") {
        obj[skey] = strSwap(obj[skey], formatterFunctions, variables, selectors, skey === "logic", obj.id);
      }
      // If this property is an array, recursively swap all elements
      else if (Array.isArray(obj[skey])) {
        obj[skey] = obj[skey].filter(allowed).map(o => {
          if (typeof o === "object") {
            return varSwapRecursive(o, formatterFunctions, variables, query, selectors);
          }
          // If this is a string, we've "hit bottom" and can swap it out with strSwap
          else if (typeof o === "string") {
            return strSwap(o, formatterFunctions, variables, selectors);
          }
          else {
            return o;
          }
        });
      }
      // If this property is an object, recursively do another swap
      // For some reason, postgres "DATE" props come through as objects. Exclude them from this object swap.
      else if (typeof obj[skey] === "object" && obj[skey] !== null && !(obj[skey] instanceof Date)) {
        obj[skey] = varSwapRecursive(obj[skey], formatterFunctions, variables, query, selectors);
      }
    }
  }
  return obj;
};

module.exports = varSwapRecursive;
