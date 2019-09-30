const libs = require("./libs");

/**
 * Formatters are stored in the database as plaintext logic. Serverside, we use
 * formatters4eval and FUNC.parse to turn them into "Real Functions." Client-side,
 * we need to create a lookup object so that different CMS cards in different languages
 * can view the different results of passing a different locale into the formatter
 * This function creates a single "instance" of formatters for a given locale, 
 * which can be added to that lookup object, keyed by its locale.
 */
const funcifyFormatterByLocale = (formatters, locale) => 
  formatters.reduce((acc, d) => {
    const f = Function("n", "libs", "locale", "formatters", d.logic);
    const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
    acc[fName] = n => f(n, libs, locale, acc);
    return acc;
  }, {});

module.exports = funcifyFormatterByLocale;
