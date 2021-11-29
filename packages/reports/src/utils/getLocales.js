// Given an env object, extract and organize the locales into a single deduped array
module.exports = env => {
  const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
  const locales = env.CANON_LANGUAGES ? env.CANON_LANGUAGES.split(",") : [localeDefault];
  if (!locales.includes(localeDefault)) locales.push(localeDefault);
  return locales;
};
