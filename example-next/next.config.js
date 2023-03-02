const {i18n} = require("./next-i18next.config");
const rootDir = process.cwd();
const path = require("path");

const nextConfig = {
  i18n,
  reactStrictMode: true,
  webpack(config, options) {
    config.resolve.alias.CustomSections = path.join(__dirname, "cms/sections");
    return config;
  }
};

module.exports = nextConfig;
