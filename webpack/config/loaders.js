const MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      appDir = process.cwd(),
      path = require("path"),
      postCSS = require("./postcss");

const cssLoaders = [
  {
    loader: "css-loader",
    options: {
      minimize: process.env.NODE_ENV === "production",
      root: process.env.CANON_BASE_URL || false,
      sourceMap: process.env.NODE_ENV === "development"
    }
  },
  {
    loader: "postcss-loader",
    options: {
      plugins: postCSS,
      sourceMap: process.env.NODE_ENV === "development"
    }
  }
];

module.exports = props => {

  props = Object.assign({
    build: "server",
    extract: false
  }, props);

  const babelPresets = [["env", {modules: false}], "react", "stage-0"];
  if (process.env.NODE_ENV === "development" && props.build === "client") babelPresets.unshift("react-hmre");

  return [
    {
      test: /\.js$|\.jsx$/,
      loader: "babel-loader",
      options: {
        compact: process.env.NODE_ENV === "production",
        presets: babelPresets,
        plugins: [
          "transform-decorators-legacy",
          "transform-react-remove-prop-types",
          "transform-react-constant-elements",
          "transform-react-inline-elements"
        ]
      },
      include: [
        path.join(appDir, "app"),
        path.join(appDir, "src"),
        path.join(appDir, "utils"),
        path.join(appDir, "node_modules/fast-sort"), // library ships ES6
        path.join(appDir, "node_modules/yn"), // library ships ES6
        path.join(appDir, "node_modules/@datawheel"), // library ships ES6
        path.join(__dirname, "../../src")
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
      use: !props.extract ? ["iso-morphic-style-loader"].concat(cssLoaders) : [MiniCssExtractPlugin.loader].concat(cssLoaders)
    }
  ];
};
