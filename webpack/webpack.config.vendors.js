const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");

const commonLoaders = [
  {
    test: /\.js$|\.jsx$/,
    loader: "babel-loader",
    options: {
      compact: false,
      presets: process.env.NODE_ENV === "development"
        ? ["react-hmre", ["env", {modules: false}], "react", "stage-0"]
        : [["env", {modules: false}], "react", "stage-0"],
      plugins: [
        "lodash",
        "transform-decorators-legacy",
        "transform-react-remove-prop-types",
        "transform-react-constant-elements",
        "transform-react-inline-elements"
      ]
    }
  }
];

const plugins = [
  new webpack.DllPlugin({
    path: path.join(assetsPath, "vendors-manifest.json"),
    name: "vendors",
    context: path.join(appDir, "node_modules")
  }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  })
];

if (process.env.NODE_ENV === "production") {
  plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}, mangle: false}));
}

plugins.push(new BundleAnalyzerPlugin({
  analyzerMode: "static",
  openAnalyzer: false,
  reportFilename: "../reports/webpack-vendors.html"
}));

module.exports = {
  name: "vendors",
  context: path.join(appDir, "node_modules"),
  entry: {
    vendors: [
      "@blueprintjs/core",
      "axios",
      "d3plus-react",
      "i18next",
      "react",
      "react-dom",
      "react-i18next",
      "react-redux",
      "react-router",
      "react-router-redux",
      "redux",
      "redux-logger",
      "redux-thunk"
    ]
  },
  output: {
    path: assetsPath,
    filename: "[name].js",
    library: "vendors",
    publicPath
  },
  module: {
    rules: commonLoaders
  },
  resolve: {
    modules: [path.join(appDir, "node_modules"), appDir, appPath, path.join(__dirname, "../src")],
    extensions: [".js", ".jsx"]
  },
  plugins
};
