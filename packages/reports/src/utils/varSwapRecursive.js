const selSwap = require("./selSwap");
const varSwap = require("./varSwap");
const buble = require("buble");
const validateDynamic = require("./selectors/validateDynamic");
const scaffoldDynamic = require("./selectors/scaffoldDynamic");

const strSwap = (str, formatterFunctions, variables, selectors, combinedLabels, isLogic = false, id = null) => {
  // First, do a selector replace of the pattern [[Selector]]
  str = selSwap(str, selectors);
  // After doing selSwap, there may be examples of {{variables}} that don't actually exist, because they came
  // from a dynamic selector. Perform an intermediate step using the _labels lookup object to help varSwap do its job
  str = varSwap(str, formatterFunctions, combinedLabels, true);
  // Now that [[selectors]] have been swapped in, and potentially missing dynamic selector variables have been "labeled",
  // do the standard varSwap: Replace all instances of the following pattern:  FormatterName{{VarToReplace}}
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

const varSwapRecursive = (sourceObj, formatterFunctions, variables, query = {}, selectors = [], combinedLabels = {}) => {
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
      // Parse out the queries into arrays. Though they should be strings like "state25,state36", also support
      // when the query is already an array, which happens when it comes from Selector.jsx
      const selections = query[s.name] !== undefined ? typeof query[s.name] === "string" ? query[s.name].split(",") : Array.isArray(query[s.name]) ? query[s.name] : false : false;
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
      // In some complex cases, selector defaults may make use of the states of OTHER selectors. This requires a second
      // loop below: temporarily store the _source in the selector for reference on that second pass.
      if (s.default.includes("[[")) {
        selector._source = s;
        selector._source.options = options;
      }
      // multi-selects can go down to zero selections, which is a state that has meaning and shouldn't be false-y.
      // Make sure that this blank state is counted as a "real state" so it doesn't erroneously revert to the defaults
      const isBlankMulti = selections.length === 1 && selections[0] === "";
      if (selections && (selections.every(sel => options.map(o => o.option).includes(sel)) || isBlankMulti)) {
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
    // As mentioned above, certain complex selectors can reference previous selectors, designated by a _source key.
    selectors.forEach(selector => {
      if (selector._source) {
        const s = selector._source;
        delete selector._source;
        // Generate the value of the default by varswap and selswap-ing the default key
        const newDefault = varSwap(selSwap(s.default, selectors), formatterFunctions, variables);
        // Adding further complexity, individual options themselves may not be allowed, based on other selector's states.
        // Prune the list of all options down to the "relevantOptions", i.e., the ones allowed for the current selector state.
        const optionAllowed = obj => !obj.allowed || obj.allowed === "always" || variables[selSwap(obj.allowed, selectors)];
        const relevantOptions = s.options.filter(optionAllowed);
        // A selector may either have just initialized (first load) and therefore will be N/A (due to having no selectors to swap)
        // Or, a previous value selector will be leftover in the params, which has been made incorrect by another selector's change.
        // For example: Changing dropdown A limits the options in dropdown B. If A is changed, B will refer to a now-stale, not-allowed value.
        const needsFixing = selector[s.name] === "N/A" || !relevantOptions.map(o => o.option).includes(selector[s.name]);
        if (needsFixing) {
          // If the selswapped newdefault processed correctly...
          if (newDefault !== "N/A") {
            // ... and it is also a valid member of the relevant options, then set it.
            if (relevantOptions.length && relevantOptions.map(o => o.option).includes(newDefault)) {
              selector[s.name] = newDefault;
            }
          }
          // If the selswapped newdefault failed for any reason, use the first option as a final fallback.
          else if (relevantOptions.length) selector[s.name] = relevantOptions[0].option;
        }
      }
    });
    combinedLabels = selectors.reduce((acc, d) => ({...acc, ...d._labels}), {});
  }

  for (const skey in obj) {
    if (obj.hasOwnProperty(skey)) {
      // If this property is a string, replace all the vars
      if (typeof obj[skey] === "string") {
        obj[skey] = strSwap(obj[skey], formatterFunctions, variables, selectors, combinedLabels, skey === "logic", obj.id);
      }
      // If this property is an array, recursively swap all elements
      else if (Array.isArray(obj[skey])) {
        obj[skey] = obj[skey].filter(allowed).map(o => {
          if (typeof o === "object") {
            return varSwapRecursive(o, formatterFunctions, variables, query, selectors, combinedLabels);
          }
          // If this is a string, we've "hit bottom" and can swap it out with strSwap
          else if (typeof o === "string") {
            return strSwap(o, formatterFunctions, variables, selectors, combinedLabels);
          }
          else {
            return o;
          }
        });
      }
      // If this property is an object, recursively do another swap
      // For some reason, postgres "DATE" props come through as objects. Exclude them from this object swap.
      else if (typeof obj[skey] === "object" && obj[skey] !== null && !(obj[skey] instanceof Date)) {
        obj[skey] = varSwapRecursive(obj[skey], formatterFunctions, variables, query, selectors, combinedLabels);
      }
    }
  }
  return obj;
};

module.exports = varSwapRecursive;
