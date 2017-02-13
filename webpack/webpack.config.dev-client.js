const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const variables = require(path.join(appPath, "style.js"));

const hotMiddlewareScript = "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true";

const commonLoaders = [
  {
    test: /\.js$|\.jsx$/,
    loader: "babel-loader",
    query: {
      compact: false,
      presets: ["react-hmre", "es2015", "react", "stage-0"],
      plugins: ["transform-decorators-legacy"]
    },
    include: [appPath, path.join(__dirname, "../src")],
    exclude: path.join(appDir, "node_modules")
  },
  {
    test: /\.json$/, loader: "json"
  },
  {
    test: /\.css$/, loader: "style!css!postcss"
  }
];

function postCSSConfig() {
  return [
    require("postcss-import")({
      path: appPath,
      addDependencyTo: webpack // for hot-reloading
    }),
    require("postcss-custom-properties")({variables}),
    require("postcss-nesting")(),
    require("postcss-conditionals")(),
    require("postcss-cssnext")({browsers: ["> 1%", "last 2 versions"]}),
    require("postcss-reporter")({clearMessages: true, filter: msg => msg.type === "warning" || msg.type !== "dependency"})
  ];
}

module.exports = {
  devtool: "eval",
  name: "browser",
  context: path.join(__dirname, "../src"),
  entry: {
    app: ["./client", hotMiddlewareScript]
  },
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({__DEVCLIENT__: true, __DEVSERVER__: false})
  ],
  postcss: postCSSConfig
};
