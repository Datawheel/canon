const funcifyFormatterByLocale = require("../utils/funcifyFormatterByLocale");

export default (resources = {}, action) => {
  switch (action.type) {
    case "FORMATTER_GET": 
      const formatterFunctions = {};
      action.locales.forEach(locale => {
        formatterFunctions[locale] = funcifyFormatterByLocale(action.data, locale);
      });
      return Object.assign({}, resources, {formatterFunctions});
    default: return resources;
  }
};
