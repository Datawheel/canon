const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const assetsPath = path.join(appDir, "static", "assets");
const publicPath = "/assets/";
const appPath = path.join(appDir, "app");
const variables = require("./require-fallback")("style.yml") || {};

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const InlineEnviromentVariablesPlugin = require("inline-environment-variables-webpack-plugin");

function postCSSConfig() {
  return [
    require("postcss-import")({path: appPath}),
    require("lost")(),
    require("postcss-mixins")(),
    require("postcss-for")(),
    require("postcss-custom-properties")({variables}),
    require("postcss-map")({maps: [variables]}),
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
      presets: [["env", {modules: false}], "react", "stage-0"],
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
    test: /\.(png|jpeg|jpg|gif|bmp|tif|tiff|svg|woff|woff2|eot|ttf)$/,
    loader: "url-loader?limit=100000"
  },
  {
    test: /\.(yaml|yml)$/,
    loader: "yml-loader"
  },
  {
    test: /\.(scss|sass|css)$/i,
    use: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [
        {loader: "css-loader", options: {minimize: process.env.NODE_ENV === "production"}},
        {loader: "postcss-loader", options: {plugins: postCSSConfig}}
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
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: false})),
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
      new webpack.DefinePlugin(Object.keys(process.env)
        .filter(e => e.startsWith("CANON_CONST_"))
        .reduce((d, k) => {
          d[`__${k.replace("CANON_CONST_", "")}__`] = JSON.stringify(process.env[k]);
          return d;
        }, {__DEV__: false, __SERVER__: true})),
      new webpack.IgnorePlugin(/vertx/),
      new InlineEnviromentVariablesPlugin({NODE_ENV: "production"})
    ]
  }
];
