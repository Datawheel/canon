const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const libPath = path.join(appDir, "lib");
const publicPath = "/assets/";
const srcPath = path.join(appDir, "src");

function postCSSConfig() {
  return [
    require("postcss-import")(),
    require("postcss-mixins")(),
    require("postcss-custom-properties")(),
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
      plugins: ["transform-decorators-legacy"]
    },
    // include: [srcPath, path.join(__dirname, "../src")],
    exclude: path.join(appDir, "node_modules")
  },
  {
    test: /\.css$/, use: [
      "style-loader",
      "css-loader",
      {
        loader: "postcss-loader",
        options: {plugins: postCSSConfig}
      }
    ]
  }
];

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
    rules: commonLoaders
  },
  resolve: {
    modules: [path.join(appDir, "node_modules"), srcPath],
    extensions: [".js", ".jsx", ".css"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({__DEVCLIENT__: true, __DEVSERVER__: false})
  ]
};
