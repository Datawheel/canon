const path = require("path");

const appDir = process.cwd();
const appPath = path.join(appDir, "app");

/** @type {import("webpack").ResolveOptions} */
const resolve = {
  alias: {
    $root: appDir,
    $app: appPath
  },
  modules: [
    appPath,
    appDir,
    path.resolve(__dirname, "../src"),
    path.resolve(appDir, "node_modules"),
    path.resolve(__dirname, "../node_modules"),
    "node_modules"
  ],
  extensions: [".js", ".jsx", ".css"]
};

module.exports = {
  resolve
};
