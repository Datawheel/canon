const axios = require("axios"),
      chalk = require("chalk"),
      express = require("express"),
      gzip = require("compression"),
      helmet = require("helmet"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack"),
      yn = require("yn");

const notifier = require("node-notifier");
const {name} = JSON.parse(shell.cat("package.json"));

const ProgressPlugin = require("webpack/lib/ProgressPlugin");

const NODE_ENV = process.env.CANON_ENV || "development";
const PORT = process.env.CANON_PORT || 3300;
const ATTRS = process.env.CANON_ATTRS;
const API = process.env.CANON_API;

const appDir = process.cwd();
const appPath = path.join(appDir, "app");

const resolve = file => {

  const fullPath = path.join(appPath, file);

  try {
    require.resolve(fullPath);
    shell.echo(`${file} loaded from .app/ directory`);
    return require(fullPath);
  }
  catch (e) {
    shell.echo(`${file} does not exist in .app/ directory, using default`);
    return false;
  }

};

shell.echo(chalk.bold("\n\n 📂  Gathering Resources\n"));
const store = resolve("store.js") || {};
store.API = API;
const headerConfig = resolve("helmet.js") || {};

const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nMiddleware = require("i18next-express-middleware");

i18n
  .use(Backend)
  .use(i18nMiddleware.LanguageDetector)
  .init({

    fallbackLng: process.env.CANON_LANGUAGE_DEFAULT || "en",
    lng: process.env.CANON_LANGUAGE_DEFAULT || "en",

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

  shell.echo(chalk.bold("\n\n 🌐  Running Express Server\n"));
  shell.echo(`Environment: ${NODE_ENV}`);
  shell.echo(`Port: ${PORT}`);

  const App = require(path.join(appDir, "static/assets/server"));
  const app = express();

  if (NODE_ENV === "development") {

    shell.echo(chalk.bold("\n\n 🔷  Bundling Client Webpack\n"));

    const webpackDevConfig = require(path.join(__dirname, "../webpack/webpack.config.dev-client"));
    const compiler = webpack(webpackDevConfig);

    shell.echo("");
    let msgLength = 0;
    compiler.apply(new ProgressPlugin(function(percentage, msg) {
      const details = Array.prototype.slice.call(arguments, 2);
      if (percentage < 1) {
        percentage = Math.floor(percentage * 100);
        msg = `${percentage}% ${msg}`;
        if (percentage < 100) msg = ` ${msg}`;
        if (percentage < 10) msg = ` ${msg}`;
        details.forEach(detail => {
          if (!detail) return;
          if (detail.length > 40) detail = `...${detail.substr(detail.length - 37)}`;
          msg += ` ${detail}`;
        });
        if (msg.length > msgLength) msgLength = msg.length + 1;
        process.stdout.write(`\r${ new Array(msgLength).join(" ") }`);
        process.stdout.write(`\r${ msg }`);
      }
      else {
        process.stdout.write(`\r${ new Array(msgLength).join(" ") }\r`);
        notifier.notify({
          title: name,
          message: "Site Rebuilt - Ready for Development"
        });
      }
    }));

    app.use(require("webpack-dev-middleware")(compiler, {noInfo: true, publicPath: webpackDevConfig.output.publicPath}));
    app.use(require("webpack-hot-middleware")(compiler));

  }

  app.set("port", PORT);

  if (NODE_ENV === "production") {
    app.use(gzip());
    const FRAMEGUARD = yn(process.env.CANON_HELMET_FRAMEGUARD);
    app.use(helmet({frameguard: FRAMEGUARD === void 0 ? false : FRAMEGUARD}));
  }

  app.use(express.static(path.join(appDir, "static")));
  app.use(i18nMiddleware.handle(i18n));

  app.set("trust proxy", "loopback");

  app.get("*", App.default(store, i18n, headerConfig));
  app.listen(PORT);

}

if (ATTRS === undefined) start();
else {

  axios.get(ATTRS)
    .then(res => {

      store.attrs = {};

      shell.echo(chalk.bold("\n\n 📚  Caching Attributes\n"));

      const promises = res.data.data.map(attr => axios.get(`${API}attrs/${attr}`)
        .then(res => {
          shell.echo(`Cached "${attr}" attributes`);
          store.attrs[attr] = res.data;
          return res;
        })
        .catch(err => {
          shell.echo(`${API}attrs/${attr} errored with code ${err.response.status}`);
          return Promise.reject(err);
        }));

      Promise.all(promises).then(start);

    });

}
