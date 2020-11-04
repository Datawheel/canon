const HardSourceWebpackPlugin = require("hard-source-webpack-plugin"),
      WebpackBar = require("webpackbar"),
      appDir = process.cwd(),
      path = require("path"),
      webpack = require("webpack"),
      yn = require("yn");

const assetsPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");

const loaderPath = require.resolve("./config/loaders");
delete require.cache[loaderPath];
const commonLoaders = require(loaderPath);

process.traceDeprecation = true;

/** @type {import("webpack").Configuration} */
module.exports = {
  devtool: "eval",
  name: "client",
  mode: "development",
  context: path.join(__dirname, "../src"),
  entry: {
    client: [
      "core-js/modules/es6.promise",
      "core-js/modules/es6.array.iterator",
      "@babel/polyfill",
      "react-hot-loader/patch",
      "webpack-hot-middleware/client",
      "./client"
    ]
  },
  output: {
    path: assetsPath,
    filename: "[name].js",
    publicPath
  },
  module: {
    rules: commonLoaders({extract: false})
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
    new webpack.NormalModuleReplacementPlugin(
      /node_modules\/@datawheel\/.*\.(css|scss|sass)$/,
      path.resolve(__dirname, "config/empty.css")
    ),
    new WebpackBar({color: "#f8c855", name: "client"}),
    new HardSourceWebpackPlugin({
      cacheDirectory: path.join(appDir, "node_modules/.cache/hard-source/[confighash]"),
      environmentHash: {
        root: appDir,
        directories: [],
        files: ["package-lock.json", "yarn.lock", "app/style.yml", ".env", ".envrc"]
      },
      info: {mode: "test", level: "error"}
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(Object.keys(process.env)
      .filter(e => e.startsWith("CANON_CONST_"))
      .reduce((d, k) => {
        d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
        return d;
      }, {__DEV__: true, __SERVER__: false, __LOGREDUX__: yn(process.env.CANON_LOGREDUX || true)}))
  ]
};
