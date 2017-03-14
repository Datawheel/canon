const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
process.traceDeprecation = true;
const commonLoaders = [
  {
    test: /\.js$|\.jsx$/,
    loader: "babel-loader",
    options: {
      compact: false,
      presets: [["es2015", {modules: false}], "react", "stage-0"],
      plugins: ["transform-decorators-legacy"]
    },
    include: [appPath, path.join(__dirname, "../src")]
  },
  {
    test: /\.css$/,
    loader: "css-loader",
    options: {
      modules: true,
      importLoaders: true
    }
  }
];

module.exports = {
  // The configuration for the server-side rendering
  name: "server-side rendering",
  context: path.join(__dirname, "../src"),
  entry: {server: "./server"},
  target: "node",
  output: {
    path: assetsPath,
    filename: "server.js",
    publicPath,
    libraryTarget: "commonjs2"
  },
  module: {
    rules: commonLoaders
  },
  resolve: {
    modules: [path.join(appDir, "node_modules"), appDir, appPath, path.join(__dirname, "../src")],
    extensions: [".js", ".jsx", ".css"]
  },
  plugins: [
    new webpack.DefinePlugin({__DEVCLIENT__: false, __DEVSERVER__: true}),
    new webpack.IgnorePlugin(/vertx/)
  ]
};
