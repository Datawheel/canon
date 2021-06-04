const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
      FriendlyErrorsWebpackPlugin = require("@nuxtjs/friendly-errors-webpack-plugin"),
      InlineEnviromentVariablesPlugin = require("inline-environment-variables-webpack-plugin"),
      LoadablePlugin = require("@loadable/webpack-plugin"),
      MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
      TerserJSPlugin = require("terser-webpack-plugin"),
      WebpackBar = require("webpackbar"),
      appDir = process.cwd(),
      commonLoaders = require("./config/loaders"),
      path = require("path"),
      webpack = require("webpack");

const assetsPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const timestamp = new Date().getTime();

const resolve = {
  alias: {
    $root: appDir,
    $app: appPath
  },
  modules: [
    appPath,
    appDir,
    path.resolve(__dirname, "../src"),
    path.resolve(appDir, "node_modules"),
    path.resolve(__dirname, "../node_modules"),
    "node_modules"
  ],
  extensions: [".js", ".jsx", ".css"]
};

/** @type {import("webpack").Configuration[]} */
module.exports = [
  {
    name: "client",
    mode: "production",
    context: path.join(__dirname, "../src"),
    entry: {
      client: [
        "normalize.css/normalize.css",
        "@blueprintjs/core/lib/css/blueprint.css",
        "@blueprintjs/icons/lib/css/blueprint-icons.css",
        "core-js/modules/es6.promise",
        "core-js/modules/es6.array.iterator",
        "@babel/polyfill",
        "./client"
      ]
    },
    performance: {
      maxEntrypointSize: Infinity,
      maxAssetSize: 1024 * 1000 * 2 // 2mb
    },
    output: {
      path: assetsPath,
      filename: "client.js",
      chunkFilename: "client-[name].js",
      publicPath
    },
    module: {
      rules: commonLoaders({
        extract: true,
        mode: "production",
        server: false
      })
    },
    resolve,
    optimization: {
      minimizer: [
        new TerserJSPlugin({}),
        new OptimizeCSSAssetsPlugin({})
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          blueprint: {test: /node_modules\/(@blueprintjs).*/, name: "blueprint", enforce: true},
          d3plus: {test: /node_modules\/(d3\-|d3plus\-).*/, name: "d3plus", enforce: true},
          normalize: {test: /node_modules\/(normalize).*/, name: "normalize", enforce: true},
          react: {test: /node_modules\/(react).*/, name: "react", enforce: true},
          canon: {test: /(@datawheel\/canon-|app\/cms\/|packages\/(cms|core|vizbuilder)\/src\/).*\.(scss|sass|css)$/, name: "canon", enforce: true, priority: 1}
        }
      }
    },
    plugins: [
      new LoadablePlugin(),
      new MiniCssExtractPlugin({
        filename: "client.css",
        chunkFilename: "client-[name].css",
        ignoreOrder: true
      }),
      new WebpackBar({color: "#f8c855", name: "client"}),
      new FriendlyErrorsWebpackPlugin({clearConsole: false}),
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
    entry: "./server",
    target: "node",
    output: {
      path: assetsPath,
      filename: "server.js",
      publicPath,
      libraryTarget: "commonjs2"
    },
    module: {
      rules: commonLoaders({mode: "production", server: true, extract: true})
    },
    resolve,
    optimization: {
      minimizer: [
        new TerserJSPlugin({terserOptions: {keep_fnames: true}}),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
      new MiniCssExtractPlugin({
        filename: "server.css",
        ignoreOrder: true
      }),
      new WebpackBar({color: "#7ab536", name: "server"}),
      new FriendlyErrorsWebpackPlugin({clearConsole: false}),
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: true, __TIMESTAMP__: timestamp})),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"}),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "../reports/webpack-prod-server.html"
      })
    ]
  }
];
