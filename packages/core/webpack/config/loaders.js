const MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      appDir = process.cwd(),
      fs = require("fs"),
      path = require("path");

const postCSSPath = require.resolve("./postcss");
delete require.cache[postCSSPath];
const postCSS = require(postCSSPath);

const cssLoaders = [
  {
    loader: "css-loader",
    options: {
      modules: "global",
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
    [require.resolve("@babel/preset-env"), {
      modules: false,
      forceAllTransforms: true
    }],
    require.resolve("@babel/preset-react")
  ];

  const babelPlugins = [

    // Stage 0
    require.resolve("@babel/plugin-proposal-function-bind"),

    // Stage 1
    require.resolve("@babel/plugin-proposal-export-default-from"),
    require.resolve("@babel/plugin-proposal-logical-assignment-operators"),
    [require.resolve("@babel/plugin-proposal-optional-chaining"), {loose: false}],
    [require.resolve("@babel/plugin-proposal-pipeline-operator"), {proposal: "minimal"}],
    [require.resolve("@babel/plugin-proposal-nullish-coalescing-operator"), {loose: false}],
    require.resolve("@babel/plugin-proposal-do-expressions"),

    // Stage 2
    [require.resolve("@babel/plugin-proposal-decorators"), {legacy: true}],
    require.resolve("@babel/plugin-proposal-function-sent"),
    require.resolve("@babel/plugin-proposal-export-namespace-from"),
    require.resolve("@babel/plugin-proposal-numeric-separator"),
    require.resolve("@babel/plugin-proposal-throw-expressions"),

    // Stage 3
    require.resolve("@babel/plugin-syntax-dynamic-import"),
    require.resolve("@babel/plugin-syntax-import-meta"),
    [require.resolve("@babel/plugin-proposal-class-properties"), {loose: false}],
    require.resolve("@babel/plugin-proposal-json-strings"),

    // React specific
    require.resolve("@babel/plugin-transform-react-constant-elements")

  ];

  if (process.env.NODE_ENV === "development") {
    babelPlugins.push(
      require.resolve("react-hot-loader/babel"),
      require.resolve("@babel/plugin-transform-react-inline-elements")
    );
  }

  // Alias configuration for user-defined modules
  const fallback = path.join(__dirname, "../../src/helpers/empty.js"); // returns {}
  const alias = {
    CustomSections: path.join(appDir, "app/cms/sections/index.js")
  };
  Object.keys(alias).forEach(d => {
    if (!fs.existsSync(alias[d])) alias[d] = fallback;
  });
  alias.$root = appDir;
  alias.$app = path.join(appDir, "app");

  return [
    {
      resolve: {
        alias
      },
      test: /\.js$|\.jsx$/,
      loader: "babel-loader",
      options: {
        compact: process.env.NODE_ENV === "production",
        presets: babelPresets,
        plugins: babelPlugins
      },
      exclude: [path.join(appDir, "node_modules", "mapbox-gl")],
      include: [
        path.join(appDir, "app"),
        path.resolve(appDir, "canon.js"),
        path.join(appDir, "src"),
        path.join(appDir, "utils"),
        path.join(appDir, "node_modules"),
        path.join(__dirname, "../../src")
      ]
    },
    {
      test: /\.(png|jpeg|jpg|gif|bmp|tif|tiff|svg|woff|woff2|eot|ttf)$/i,
      loader: "url-loader?limit=100000"
      // fallback defaults to file-loader
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
