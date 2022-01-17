const FriendlyErrorsWebpackPlugin = require("@nuxtjs/friendly-errors-webpack-plugin"),
      HardSourceWebpackPlugin = require("hard-source-webpack-plugin"),
      MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      WebpackBar = require("webpackbar"),
      appDir = process.cwd(),
      commonLoaders = require("./config/loaders"),
      path = require("path"),
      webpack = require("webpack");

const commonConfig = require("./config/common");

const assetsPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets");
const publicPath = "/assets/";

process.traceDeprecation = true;

/** @type {import("webpack").Configuration} */
module.exports = {
  name: "server",
  mode: "development",
  context: path.join(__dirname, "../src"),
  entry: {
    server: [
      "normalize.css/normalize.css",
      "@blueprintjs/core/lib/css/blueprint.css",
      "@blueprintjs/icons/lib/css/blueprint-icons.css",
      "core-js/modules/es6.promise",
      "core-js/modules/es6.array.iterator",
      "@babel/polyfill",
      "./server"
    ]
  },
  target: "node",
  output: {
    path: assetsPath,
    filename: "server.js",
    publicPath,
    libraryTarget: "commonjs2"
  },
  module: {
    rules: commonLoaders({
      extract: true,
      mode: "development",
      server: true
    })
  },
  resolve: commonConfig.resolve,
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /\/app\/.*\.(css|scss|sass)$/,
      path.resolve(__dirname, "config/empty.css")
    ),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new MiniCssExtractPlugin({
      filename: "styles.css",
      ignoreOrder: true
    }),
    new WebpackBar({color: "#7ab536", name: "server"}),
    new FriendlyErrorsWebpackPlugin({clearConsole: false}),
    new HardSourceWebpackPlugin({
      cacheDirectory: path.join(appDir, "node_modules/.cache/hard-source/[confighash]"),
      environmentHash: {
        root: appDir,
        directories: [],
        files: ["package-lock.json", "yarn.lock", "app/style.yml", ".env", ".envrc"]
      },
      info: {mode: "test", level: "error"}
    }),
    new HardSourceWebpackPlugin.ExcludeModulePlugin([
      {test: /mini-css-extract-plugin[\\/]dist[\\/]loader/}
    ]),
    new webpack.DefinePlugin(Object.keys(process.env)
      .filter(e => e.startsWith("CANON_CONST_"))
      .reduce((d, k) => {
        d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
        return d;
      }, {__DEV__: true, __SERVER__: true, __TIMESTAMP__: new Date().getTime()}))
  ]
};
