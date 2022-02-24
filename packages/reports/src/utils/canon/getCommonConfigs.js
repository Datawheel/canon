const getAxiosConfig = require("./getAxiosConfig");
const getCanonVars = require("./getCanonVars");
const getLocales = require("./getLocales");
const getLogging = require("./getLogging");

module.exports = (env = process.env) => ({
  axiosConfig: getAxiosConfig({}, env),
  canonVars: getCanonVars(env),
  verbose: getLogging(env),
  ...getLocales(env)
});
