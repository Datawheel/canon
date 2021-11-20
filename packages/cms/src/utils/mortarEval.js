const libs = require("./libs"); //eslint-disable-line
const yn = require("yn");

const localeDefault = process.env.CANON_LANGUAGE_DEFAULT || "en";
const verbose = yn(process.env.CANON_CMS_LOGGING);

module.exports = (varInnerName, varOuterValue, logic, formatterFunctions, locale = localeDefault, attributes = false) => { //eslint-disable-line
  let vars = {}; //eslint-disable-line
  // Because logic is arbitrary javascript, it may be malformed. We need to wrap the
  // entire execution in a try/catch.
  try {
    if (varOuterValue) {

      const log = [];
      const mortarLog = text => { //eslint-disable-line
        log.push(text);
        if (verbose) console.log(text);
      };
      logic = logic.replace(/console\.log\(([^)]+)\)/g, "mortarLog($1)");

      // If attributes has been set, this is being run by a generator who is providing search attributes.
      // We want those attributes to be available as variables, so pass that in as an argument
      if (attributes) {
        eval(`
          let f = (${varInnerName}, libs, formatters, locale, variables) => {${logic}};
          vars = f(varOuterValue, libs, formatterFunctions, locale, attributes);
        `);
      }
      // If attributes hasn't been set, this is being run by a materializer. Because a materializer can't ever
      // be run without generators being run first (and injecting attributes above), we don't need anything special
      // and can just pass in the variables as normal (via varInnerName)
      else {
        eval(`
          let f = (${varInnerName}, libs, formatters, locale) => {${logic}};
          vars = f(varOuterValue, libs, formatterFunctions, locale);
        `);
      }
      // A successfully run eval will return the vars generated
      return {vars, error: null, log};
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
