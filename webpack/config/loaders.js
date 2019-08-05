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

  const babelPresets = [
    ["@babel/preset-env", {
      modules: false,
      forceAllTransforms: true,
      exclude: ["/mapbox-gl"]
    }],
    "@babel/preset-react"
  ];

  const babelPlugins = [

    // Stage 0
    "@babel/plugin-proposal-function-bind",

    // Stage 1
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-logical-assignment-operators",
    ["@babel/plugin-proposal-optional-chaining", {loose: false}],
    ["@babel/plugin-proposal-pipeline-operator", {proposal: "minimal"}],
    ["@babel/plugin-proposal-nullish-coalescing-operator", {loose: false}],
    "@babel/plugin-proposal-do-expressions",

    // Stage 2
    ["@babel/plugin-proposal-decorators", {legacy: true}],
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-throw-expressions",

    // Stage 3
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    ["@babel/plugin-proposal-class-properties", {loose: false}],
    "@babel/plugin-proposal-json-strings",

    // React specific
    "@babel/plugin-transform-react-constant-elements"

  ];

  if (process.env.NODE_ENV === "development") {
    babelPlugins.push("@babel/plugin-transform-react-inline-elements");
  }

  return [
    {
      test: /\.js$|\.jsx$/,
      loader: "babel-loader",
      options: {
        compact: process.env.NODE_ENV === "production",
        presets: babelPresets,
        plugins: babelPlugins
      },
      include: [
        path.join(appDir, "app"),
        path.join(appDir, "src"),
        path.join(appDir, "utils"),
        path.join(appDir, "node_modules"),
        path.join(__dirname, "../../src")
      ]
    },
    {
      test: /\.(png|jpeg|jpg|gif|bmp|tif|tiff|svg|woff|woff2|eot|ttf)$/i,
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
