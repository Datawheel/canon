const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");
const yn = require("yn");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const variables = require("./require-fallback")("style.js") || {};

const hotMiddlewareScript = "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true";

function postCSSConfig() {
  return [
    require("postcss-import")({
      path: appPath,
      addDependencyTo: webpack // for hot-reloading
    }),
    require("lost")(),
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
      compact: false,
      presets: ["react-hmre", ["es2015", {modules: false}], "react", "stage-0"],
      plugins: [
        "transform-decorators-legacy",
        "transform-react-remove-prop-types",
        "transform-react-constant-elements",
        "transform-react-inline-elements"
      ]
    },
    include: [
      appPath,
      path.join(appDir, "node_modules/yn"),
      path.join(__dirname, "../src")
    ]
  },
  {
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    loader: "url-loader?limit=100000"
  },
  {
    test: /\.css$/,
    use: [
      "style-loader",
      {loader: "css-loader", options: {minimize: process.env.NODE_ENV === "production"}},
      {loader: "postcss-loader", options: {plugins: postCSSConfig, sourceMap: true}}
    ]
  }
];

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
    rules: commonLoaders
  },
  resolve: {
    modules: [path.join(appDir, "node_modules"), appDir, appPath, path.join(__dirname, "../src")],
    extensions: [".js", ".jsx", ".css"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({__DEVCLIENT__: true, __DEVSERVER__: false, __LOGREDUX__: yn(process.env.CANON_LOGREDUX || true)})
  ]
};
