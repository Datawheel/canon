const path = require("path");

const defaultConfig = {
  refresh: getCanonConfig
};

module.exports = getCanonConfig;

/**
 * Reads the canon.js file for the current app, and updates the central canon
 * config with its contents.
 */
function getCanonConfig() {
  const canonConfigPath = path.resolve("canon");
  const resolvedPath = require.resolve(canonConfigPath);
  console.log(canonConfigPath, resolvedPath);

  delete require.cache[resolvedPath];
  const canonConfig = require(resolvedPath);

  return Object.assign({}, defaultConfig, canonConfig);
}
