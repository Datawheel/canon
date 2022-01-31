const getLocales = require("./getLocales");

module.exports = (env = process.env) => {

  const {
    localeDefault: CANON_LANGUAGE_DEFAULT,
    locales: CANON_LANGUAGES
  } = getLocales(env);

  const canonVars = {
    CANON_API: env.CANON_API,
    CANON_LANGUAGE_DEFAULT,
    CANON_LANGUAGES,
    CANON_LOGINS: env.CANON_LOGINS || false,
    CANON_LOGLOCALE: env.CANON_LOGLOCALE,
    CANON_LOGREDUX: env.CANON_LOGREDUX,
    CANON_PORT: env.CANON_PORT || 3300,
    NODE_ENV: env.NODE_ENV || "development"
  };

  Object.keys(env).forEach(k => {
    if (k.startsWith("CANON_CONST_")) {
      canonVars[k.replace("CANON_CONST_", "")] = env[k];
    }
};
