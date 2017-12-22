const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const modules = require("./es-modules");

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
      presets: [["env", {modules: false}], "react", "stage-0"],
      plugins: [
        ["direct-import", modules],
        "lodash",
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
    test: /\.(png|jpeg|jpg|gif|bmp|tif|tiff|svg|woff|woff2|eot|ttf)$/,
    loader: "url-loader?limit=100000"
  },
  {
    test: /\.(yaml|yml)$/,
    loader: "yml-loader"
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
  name: "server",
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
    new webpack.DefinePlugin(Object.keys(process.env)
      .filter(e => e.startsWith("CANON_CONST_"))
      .reduce((d, k) => {
        d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
        return d;
      }, {__DEV__: true, __SERVER__: true})),
    new webpack.IgnorePlugin(/vertx/),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: "../reports/webpack-dev-server.html"
    })
  ]
};
