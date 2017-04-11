const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const variables = require(path.join(appPath, "style.js"));

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const InlineEnviromentVariablesPlugin = require("inline-environment-variables-webpack-plugin");

function postCSSConfig() {
  return [
    require("postcss-import")({path: appPath}),
    require("postcss-mixins")(),
    require("postcss-custom-properties")({variables}),
    require("postcss-nesting")(),
    require("postcss-conditionals")(),
    require("postcss-cssnext")({browsers: ["> 1%", "last 2 versions"]}),
    require("postcss-reporter")({clearMessages: true, filter: msg => msg.type === "warning" || msg.type !== "dependency"})
  ];
}

const commonLoaders = [
  {
    test: /\.js$|\.jsx$/,
    loader: "babel-loader",
    options: {
      compact: true,
      presets: [["es2015", {modules: false}], "react", "stage-0"],
      plugins: [
        "transform-decorators-legacy",
        "transform-react-remove-prop-types",
        "transform-react-constant-elements",
        "transform-react-inline-elements"
      ]
    },
    include: [appPath, path.join(__dirname, "../src")]
  },
  {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [
        "css-loader",
        {
          loader: "postcss-loader",
          options: {plugins: postCSSConfig}
        }
      ]
    })
  }
];

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
      rules: commonLoaders
    },
    resolve: {
      modules: [path.join(appDir, "node_modules"), appDir, appPath, path.join(__dirname, "..")],
      extensions: [".js", ".jsx", ".css"]
    },
    plugins: [
      new ExtractTextPlugin({
        filename: "styles.css",
        allChunks: true
      }),
      new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}, mangle: false}),
      new webpack.DefinePlugin({__DEVCLIENT__: false, __DEVSERVER__: false}),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"})
    ]
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
      rules: commonLoaders
    },
    resolve: {
      modules: [path.join(appDir, "node_modules"), appDir, appPath, path.join(__dirname, "../src")],
      extensions: [".js", ".jsx", ".css"]
    },
    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new ExtractTextPlugin({
        filename: "styles.css",
        allChunks: true
      }),
      new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}, mangle: {keep_fnames: true}}),
      new webpack.DefinePlugin({__DEVCLIENT__: false, __DEVSERVER__: false}),
      new webpack.IgnorePlugin(/vertx/),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"})
    ]
  }
];
