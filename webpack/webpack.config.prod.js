const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
      ExtractTextPlugin = require("extract-text-webpack-plugin"),
      InlineEnviromentVariablesPlugin = require("inline-environment-variables-webpack-plugin"),
      appDir = process.cwd(),
      commonLoaders = require("./config/loaders"),
      path = require("path"),
      webpack = require("webpack");


const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");

module.exports = [
  {
    name: "client",
    devtool: "cheap-module-source-map",
    context: path.join(__dirname, "../src"),
    entry: {app: "./client"},
    output: {
      path: assetsPath,
      filename: "[name].js",
      publicPath
    },
    module: {
      rules: commonLoaders({extract: true})
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
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: false})),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"}),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "../reports/webpack-prod-client.html"
      })
    ]
  },
  {
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
      new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}, mangle: {keep_fnames: true}}),
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: true})),
      new webpack.IgnorePlugin(/vertx/),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"}),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "../reports/webpack-prod-server.html"
      })
    ]
  }
];
