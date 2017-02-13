const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const variables = require(path.join(appPath, "style.js"));

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const InlineEnviromentVariablesPlugin = require("inline-environment-variables-webpack-plugin");

const commonLoaders = [
  {
    test: /\.js$|\.jsx$/,
    loader: "babel-loader",
    query: {
      compact: true,
      presets: ["es2015", "react", "stage-0"],
      plugins: [
        "transform-decorators-legacy",
        "transform-react-remove-prop-types",
        "transform-react-constant-elements",
        "transform-react-inline-elements"
      ]
    },
    include: [appPath, path.join(__dirname, "../src")],
    exclude: path.join(appDir, "node_modules")
  },
  {
    test: /\.json$/, loader: "json"
  },
  {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract("style", "css!postcss")
  }
];

function postCSSConfig() {
  return [
    require("postcss-import")({path: appPath}),
    require("postcss-custom-properties")({variables}),
    require("postcss-nesting")(),
    require("postcss-conditionals")(),
    require("postcss-cssnext")({browsers: ["> 1%", "last 2 versions"]}),
    require("postcss-reporter")({clearMessages: true, filter: msg => msg.type === "warning" || msg.type !== "dependency"})
  ];
}

module.exports = [
  {
    name: "browser",
    devtool: "cheap-module-source-map",
    context: path.join(__dirname, "../src"),
    entry: {app: "./client"},
    output: {
      path: assetsPath,
      filename: "[name].js",
      publicPath
    },
    module: {
      loaders: commonLoaders
    },
    resolve: {
      root: [appDir, appPath],
      extensions: ["", ".js", ".jsx", ".css"]
    },
    plugins: [
      new ExtractTextPlugin("styles.css", {allChunks: true}),
      new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}}),
      new webpack.DefinePlugin({__DEVCLIENT__: false, __DEVSERVER__: false}),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"})
    ],
    postcss: postCSSConfig
  },
  {
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
      new webpack.optimize.OccurenceOrderPlugin(),
      new ExtractTextPlugin("styles.css", {allChunks: true}),
      new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}}),
      new webpack.DefinePlugin({__DEVCLIENT__: false, __DEVSERVER__: false}),
      new webpack.IgnorePlugin(/vertx/),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"})
    ],
    postcss: postCSSConfig
  }
];
