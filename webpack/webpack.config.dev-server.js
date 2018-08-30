const ExtractTextPlugin = require("extract-text-webpack-plugin"),
      HardSourceWebpackPlugin = require("hard-source-webpack-plugin"),
      appDir = process.cwd(),
      commonLoaders = require("./config/loaders"),
      path = require("path"),
      webpack = require("webpack");

const assetsPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");

process.traceDeprecation = true;

module.exports = {
  name: "server",
  context: path.join(__dirname, "../src"),
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
    modules: [path.join(appDir, "node_modules"), appDir, appPath, path.join(__dirname, "../src")],
    extensions: [".js", ".jsx", ".css"]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: "styles.css",
      allChunks: true
    }),
    new HardSourceWebpackPlugin({cacheDirectory: path.join(appDir, "node_modules/.cache/hard-source/[confighash]")}),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin(Object.keys(process.env)
      .filter(e => e.startsWith("CANON_CONST_"))
      .reduce((d, k) => {
        d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
        return d;
      }, {__DEV__: true, __SERVER__: true}))
  ]
};
