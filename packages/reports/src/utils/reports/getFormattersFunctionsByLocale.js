const getLocales = require("../canon/getLocales");
const formatters4eval = require("../formatters4eval");
let formatterFunctionsByLocale;

module.exports = async(db, env = process.env) => {
  if (!formatterFunctionsByLocale) {
    const formatters = await db.formatter.findAll().catch(() => []);
    const {locales} = getLocales(env);
    formatterFunctionsByLocale = locales.reduce((acc, locale) => ({...acc, [locale]: formatters4eval(formatters, locale)}), {});
  }
  return formatterFunctionsByLocale;
};
