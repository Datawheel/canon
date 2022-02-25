const getAxiosConfig = require("./getAxiosConfig");
const getCanonVars = require("./getCanonVars");
const getLocales = require("./getLocales");
const getLogging = require("./getLogging");
const getImageConfig = require("./getImageConfig");

module.exports = (env = process.env) => ({
  axiosConfig: getAxiosConfig({}, env),
  canonVars: getCanonVars(env),
  verbose: getLogging(env),
  imageConfig: getImageConfig(env),
  ...getLocales(env)
});
