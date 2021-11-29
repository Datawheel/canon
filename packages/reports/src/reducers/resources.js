const funcifyFormatterByLocale = require("../utils/funcifyFormatterByLocale");

/** 
 * Notice that there is no FORMATTER_NEW case here. New formatters simply return `n` and have no name,
 * so there is no need to recompile anything until the user performs the update action.
 */
export default (resources = {}, action) => {
  const formatterFunctions = {};
  switch (action.type) {
    case "FORMATTER_GET": 
      action.locales.forEach(locale => {
        formatterFunctions[locale] = funcifyFormatterByLocale(action.data, locale);
      });
      return Object.assign({}, resources, {formatterFunctions});
    case "FORMATTER_UPDATE": 
      action.locales.forEach(locale => {
        formatterFunctions[locale] = funcifyFormatterByLocale(action.data.formatters, locale);
      });
      return Object.assign({}, resources, {formatterFunctions});
    case "FORMATTER_DELETE": 
      action.locales.forEach(locale => {
        formatterFunctions[locale] = funcifyFormatterByLocale(action.data, locale);
      });
      return Object.assign({}, resources, {formatterFunctions});
    default: return resources;
  }
};
