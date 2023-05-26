// eslint-disable-next-line no-unused-vars
import libs from "./libs";

const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";

const mortarEval = (varInnerName, varOuterValue, logic, formatterFunctions, locale = envLoc, attributes = false) => {
  let vars = {};
  // Because logic is arbitrary javascript, it may be malformed. We need to wrap the
  // entire execution in a try/catch.
  try {
    if (varOuterValue) {
      // If attributes has been set, this is being run by a generator who is providing search attributes.
      // We want those attributes to be available as variables, so pass that in as an argument
      if (attributes) {
        const fn = new Function(varInnerName, "libs", "formatters", "locale", "variables", logic);
        vars = fn(varOuterValue, libs, formatterFunctions, locale, attributes);
      }
      // If attributes hasn't been set, this is being run by a materializer. Because a materializer can't ever
      // be run without generators being run first (and injecting attributes above), we don't need anything special
      // and can just pass in the variables as normal (via varInnerName)
      else {
        const fn = new Function(varInnerName, "libs", "formatters", "locale", logic);
        vars = fn(varOuterValue, libs, formatterFunctions, locale);
      }
      // A successfully run eval will return the vars generated
      return {vars, error: null};
    }
    else {
      // If varOuterValue was null, then the API that gave it to us was incorrect
      return {vars, error: "Invalid API Link"};
    }
  }
  catch (e) {
    // An unsuccessfully run eval returns the error
    return {vars, error: e.message};
  }
};

export default mortarEval;
