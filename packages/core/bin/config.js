const path = require("path");
const canonConfigPath = path.resolve("canon.js");

const defaultConfig = {
  db: [],
  i18nConfig: {},
  plugins: []
};

module.exports = getCanonConfig;

/**
 * Reads the canon.js file for the current app, and updates the central canon
 * config with its contents.
 * This function must be used on server-side code only.
 *
 * @returns {Canon.Config}
 */
function getCanonConfig() {
  const resolvedPath = require.resolve(canonConfigPath);

  delete require.cache[resolvedPath];
  const canonConfig = require(resolvedPath);

  return Object.assign({}, defaultConfig, canonConfig);
}
