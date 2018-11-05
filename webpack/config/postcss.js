const appDir = process.cwd(),
      path = require("path");

const appPath = path.join(appDir, "app");

const variables = require("../require-fallback")("style.yml") || {};

module.exports = [
  require("postcss-import")({
    addDependencyTo: process.env.NODE_ENV === "development" ? require("webpack") : undefined,
    path: appPath
  }),
  require("lost")(),
  require("pixrem")(),
  require("postcss-mixins")(),
  require("postcss-each")(),
  require("postcss-for")(),
  require("postcss-custom-properties")({
    variables
  }),
  require("postcss-map")({
    maps: [variables]
  }),
  require("postcss-nesting")(),
  require("postcss-conditionals")(),
  require("postcss-cssnext")({
    browsers: ["> 1%", "last 2 versions"]
  }),
  require("postcss-reporter")({
    filter: msg => msg.type === "warning" || msg.type !== "dependency"
  })
];
