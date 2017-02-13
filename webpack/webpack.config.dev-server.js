const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");

const commonLoaders = [
  {
    test: /\.js$|\.jsx$/,
    loader: "babel-loader",
    query: {
      compact: false,
      presets: ["es2015", "react", "stage-0"],
      plugins: ["transform-decorators-legacy"]
    },
    include: [appPath, path.join(__dirname, "../src")],
    exclude: path.join(appDir, "node_modules")
  },
  {
    test: /\.json$/, loader: "json"
  },
  {
    test: /\.css$/, loader: "css?modules&importLoaders=1"
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
    loaders: commonLoaders
  },
  resolve: {
    root: [appDir, appPath],
    extensions: ["", ".js", ".jsx", ".css"]
  },
  plugins: [
    new webpack.DefinePlugin({__DEVCLIENT__: false, __DEVSERVER__: true}),
    new webpack.IgnorePlugin(/vertx/)
  ]
};
