const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
      InlineEnviromentVariablesPlugin = require("inline-environment-variables-webpack-plugin"),
      MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      WebpackBar = require("webpackbar"),
      appDir = process.cwd(),
      commonLoaders = require("./config/loaders"),
      path = require("path"),
      webpack = require("webpack"),
      TerserJSPlugin = require("terser-webpack-plugin"),
      OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const assetsPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const timestamp = new Date().getTime();

/** @type {import("webpack").Configuration[]} */
module.exports = [
  {
    name: "client",
    mode: "production",
    devtool: "cheap-module-source-map",
    context: path.join(__dirname, "../src"),
    entry: {
      app: [
        "@babel/polyfill",
        "./client"
      ]
    },
    output: {
      path: assetsPath,
      filename: "[name].js",
      publicPath
    },
    module: {
      rules: commonLoaders({extract: true})
    },
    resolve: {
      alias: {
        $root: appDir,
        $app: appPath
      },
      modules: [
        appPath,
        appDir,
        path.resolve(appDir, "node_modules"),
        path.resolve(__dirname, "../node_modules"),
        "node_modules"
      ],
      extensions: [".js", ".jsx", ".css"]
    },
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
    },
    plugins: [
      new WebpackBar({
        color: "#fc6",
        name: "client"
      }),
      new MiniCssExtractPlugin({
        filename: "styles.css"
      }),
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: false, __TIMESTAMP__: timestamp})),
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
    mode: "production",
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
    optimization: {
      minimizer: [new TerserJSPlugin({terserOptions: {warnings: false, mangle: true, keep_fnames: true}}), new OptimizeCSSAssetsPlugin({})]
    },
    plugins: [
      new WebpackBar({
        color: "#CB9F2C",
        name: "server"
      }),
      new MiniCssExtractPlugin({
        filename: "styles.css"
      }),
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: true, __TIMESTAMP__: timestamp})),
      // new webpack.IgnorePlugin(/vertx/),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"}),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "../reports/webpack-prod-server.html"
      })
    ]
  }
];
