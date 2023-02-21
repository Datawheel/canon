const {i18n} = require("./next-i18next.config");

const {NEXT_PUBLIC_CMS} = process.env;

const nextConfig = {
  i18n,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path",
        destination: `${NEXT_PUBLIC_CMS}:path*`
      }
    ];
  }
};

module.exports = nextConfig;
