const path = require("path");
const appDir = process.cwd();
const webpack = require("webpack");

const libPath = path.join(appDir, "lib");
const publicPath = "/assets/";
const srcPath = path.join(appDir, "src");

function postCSSConfig() {
  return [
    require("postcss-import")(),
    require("lost")(),
    require("postcss-mixins")(),
    require("postcss-for")(),
    require("postcss-custom-properties")(),
    require("postcss-map")(),
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
      presets: ["react-hmre", ["env", {modules: false}], "react", "stage-0"],
      plugins: [
        "transform-decorators-legacy",
        "transform-react-remove-prop-types",
        "transform-react-constant-elements",
        "transform-react-inline-elements"
      ]
    }
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
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
