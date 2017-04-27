const axios = require("axios"),
      express = require("express"),
      flash = require("express-flash"),
      gzip = require("compression"),
      helmet = require("helmet"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack");

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3300;
const ATTRS = process.env.ATTRS;
const API = process.env.API;

const appDir = process.cwd();
const appPath = path.join(appDir, "app");

const resolve = file => {

  const fullPath = path.join(appPath, file);

  try {
    require.resolve(fullPath);
    shell.echo(`   ✅️  ${file} loaded from .app/ directory`);
    return require(fullPath);
  }
  catch (e) {
    shell.echo(`   ⚠️  ${file} does not exist in .app/ directory, using default`);
    return false;
  }

};

shell.echo("\n\n📂  Gathering resources\n");
const store = resolve("store.js") || {};
const headerConfig = resolve("helmet.js") || {};

const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nMiddleware = require("i18next-express-middleware");

i18n
  .use(Backend)
  .use(i18nMiddleware.LanguageDetector)
  .init({

    fallbackLng: process.env.LANGUAGE_DEFAULT || "en",
    lng: process.env.LANGUAGE_DEFAULT || "en",

    // have a common namespace used around the full app
    ns: ["canon"],
    defaultNS: "canon",

    debug: false,

    interpolation: {
      escapeValue: false // not needed for react!!
    },

    backend: {
      loadPath: path.join(appDir, "locales/{{lng}}/{{ns}}.json"),
      jsonIndent: 2
    }

  });

function start() {

  const App = require(path.join(appDir, "static/assets/server"));

  const app = express();

  if (NODE_ENV === "development") {
    const webpackDevConfig = require(path.join(__dirname, "../webpack/webpack.config.dev-client"));
    const compiler = webpack(webpackDevConfig);
    app.use(require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: webpackDevConfig.output.publicPath
    }));
    app.use(require("webpack-hot-middleware")(compiler));
  }

  app.set("port", PORT);

  if (NODE_ENV === "production") {
    app.use(gzip());
    app.use(helmet());
  }

  app.use(express.static(path.join(appDir, "static")));
  app.use(i18nMiddleware.handle(i18n));

  app.set("trust proxy", "loopback");

  app.use(flash());

  app.get("*", App.default(store, i18n, headerConfig));
  app.listen(PORT);

  shell.echo("\n\n🌐  Initialized Express Server\n");
  shell.echo(`   ⚙️  Environment: ${NODE_ENV}`);
  shell.echo(`   ⚙️  Port: ${PORT}`);
  shell.echo("\n");

}

if (ATTRS === undefined) start();
else {

  axios.get(ATTRS)
    .then(res => {

      store.attrs = {};

      shell.echo("\n📚  Caching Attributes\n");

      const promises = res.data.data.map(attr => axios.get(`${API}attrs/${attr}`)
        .then(res => {
          shell.echo(`   ✅️  Cached ${attr} attributes`);
          store.attrs[attr] = res.data;
          return res;
        })
        .catch(err => {
          shell.echo(`   ❌  ${API}attrs/${attr} errored with code ${err.response.status}`);
          return Promise.reject(err);
        }));

      Promise.all(promises).then(start);

    });

}
