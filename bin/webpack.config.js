const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const libPath = path.join(appDir, "lib");
const publicPath = "/assets/";
const srcPath = path.join(appDir, "src");

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
    // include: [srcPath, path.join(__dirname, "../src")],
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
    require("postcss-import")(),
    require("postcss-custom-properties")(),
    require("postcss-nesting")(),
    require("postcss-conditionals")(),
    require("postcss-cssnext")({browsers: ["> 1%", "last 2 versions"]}),
    require("postcss-reporter")({clearMessages: true, filter: msg => msg.type === "warning" || msg.type !== "dependency"})
  ];
}

module.exports = {
  devtool: "eval",
  name: "compiled",
  context: srcPath,
  entry: "./index",
  output: {
    path: libPath,
    filename: "[name].js",
    publicPath
  },
  module: {
    loaders: commonLoaders
  },
  resolve: {
    root: srcPath,
    extensions: ["", ".js", ".jsx", ".css"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({__DEVCLIENT__: true, __DEVSERVER__: false})
  ],
  postcss: postCSSConfig
};
