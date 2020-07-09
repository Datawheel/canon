const FriendlyErrorsWebpackPlugin = require("@nuxtjs/friendly-errors-webpack-plugin"),
      HardSourceWebpackPlugin = require("hard-source-webpack-plugin"),
      MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      WebpackBar = require("webpackbar"),
      appDir = process.cwd(),
      commonLoaders = require("./config/loaders"),
      path = require("path"),
      webpack = require("webpack");

const assetsPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const context = path.join(__dirname, "../src");

process.traceDeprecation = true;

/** @type {import("webpack").Configuration} */
module.exports = {
  name: "server",
  mode: "development",
  context,
  entry: {
    server: "./server"
  },
  target: "node",
  output: {
    path: assetsPath,
    filename: "server.js",
    publicPath,
    libraryTarget: "commonjs2"
  },
  module: {
    rules: commonLoaders({extract: true})
  },
  resolve: {
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
  },
  plugins: [
    new WebpackBar({color: "#CB9F2C", name: "server"}),
    new FriendlyErrorsWebpackPlugin({clearConsole: false}),
    new MiniCssExtractPlugin({
      filename: "styles.css"
    }),
    new HardSourceWebpackPlugin({
      cacheDirectory: path.join(appDir, "node_modules/.cache/hard-source/[confighash]"),
      environmentHash: {
        root: appDir,
        directories: [],
        files: ["package-lock.json", "yarn.lock", "app/style.yml", ".env", ".envrc"]
      },
      info: {level: "error"}
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
