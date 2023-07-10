const {i18n} = require("./next-i18next.config");

const nextConfig = {
  i18n,
  reactStrictMode: true,
  webpack: config => {
    config.resolve.fallback = {fs: false};
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300
    };
    return config;
  }
};

module.exports = nextConfig;
