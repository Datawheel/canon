const appDir = process.cwd(),
      css2json = require("css2json"),
      path = require("path"),
      shell = require("shelljs");

const commonConfig = require("./common");
const appPath = path.join(appDir, "app");

const userVariables = require("../require-fallback")("style.yml") || {};
const customProperties = {};
for (const key in userVariables) {
  if ({}.hasOwnProperty.call(userVariables, key) && !key.includes(" ")) {
    customProperties[`${key.startsWith("--") ? "" : "--"}${key}`] = userVariables[key];
  }
}

const canonVariables = css2json(shell.cat(path.join(__dirname, "../../src/variables.css")))[":root"];
const variables = Object.assign({}, canonVariables, customProperties);
for (const key in variables) {
  if ({}.hasOwnProperty.call(variables, key) && !key.includes(" ")) {
    const fallbackRegex = /var\((\-\-[^\)]+)\)/gm;
    let match;
    const testString = variables[key];
    do {
      match = fallbackRegex.exec(testString);
      if (match) variables[key] = variables[key].replace(match[0], variables[match[1]]);
    } while (match);
  }
}

const assetBase = process.env.CANON_BASE_URL || "";
const aliases = Object.entries(commonConfig.resolve.alias || {})
  .map(alias => [`${alias[0]}/`, alias[1]]);
const importResolver = require("postcss-import/lib/resolve-id");

module.exports = [
  require("postcss-import")({
    path: appPath,
    resolve(id, basedir, options) {
      // Resolve aliases
      for (const [alias, aliasTarget] of aliases) {
        if (id.startsWith(alias)) {
          return importResolver(id.slice(alias.length), aliasTarget, options);
        }
      }
      // Resolve using generic resolver
      return importResolver(id, basedir, options);
    }
  }),
  require("lost")(),
  require("pixrem")(),
  require("postcss-mixins")(),
  require("postcss-each")(),
  require("postcss-for")(),
  require("postcss-preset-env")({
    browsers: ["> 1%", "last 2 versions"],
    features: {
      "custom-properties": false,
      "focus-within-pseudo-class": false,
      "nesting-rules": true
    },
    preserve: false
  }),
  require("postcss-css-variables")({
    preserve: true,
    variables
  }),
  require("postcss-map")({
    maps: [variables]
  }),
  require("postcss-conditionals")(),
  require("postcss-reporter")({
    filter: msg => msg.type === "warning" || msg.type !== "dependency"
  }),
  require("postcss-flexbugs-fixes")(),
  require("postcss-url")({
    url: asset => `${assetBase}${asset.url}`
  }),
  require("postcss-combine-duplicated-selectors")({
    removeDuplicatedValues: true
  })
];
