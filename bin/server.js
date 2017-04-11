const axios = require("axios");
const gzip = require("compression");
const express = require("express");
const flash = require("express-flash");
const helmet = require("helmet");
const path = require("path");
const webpack = require("webpack");

const appDir = process.cwd();
const env = require(path.join(appDir, "app/.env"));
const store = require(path.join(appDir, "app/store"));



const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nMiddleware = require("i18next-express-middleware");

i18n
  .use(Backend)
  .use(i18nMiddleware.LanguageDetector)
  .init({

    fallbackLng: "en",
    lng: "en",

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

  console.log("\n🌐  Starting Express Server\n");
  console.log(`   ⚙️  Environment: ${env.NODE_ENV}`);

  const app = express();

  if (env.NODE_ENV === "development") {
    const webpackDevConfig = require(path.join(__dirname, "../webpack/webpack.config.dev-client"));
    const compiler = webpack(webpackDevConfig);
    app.use(require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: webpackDevConfig.output.publicPath
    }));
    app.use(require("webpack-hot-middleware")(compiler));
  }

  app.set("port", env.PORT);

  if (env.NODE_ENV === "production") {
    app.use(gzip());
    app.use(helmet());
  }

  app.use(express.static(path.join(appDir, "static")));
  app.use(i18nMiddleware.handle(i18n));

  app.set("trust proxy", "loopback");

  app.use(flash());

  app.get("*", App.default(store, i18n));
  app.listen(env.PORT);

  console.log(`   ⚙️  Port: ${env.PORT}`);
  console.log("\n");

}

if (env.ATTRS === void 0) start();
else {

  axios.get(env.ATTRS)
    .then(res => {

      store.attrs = {};

      console.log("\n📚  Caching Attributes\n");

      const promises = res.data.data.map(attr => axios.get(`${env.API}attrs/${attr}`)
        .then(res => {
          console.log(`   ✅️  Cached ${attr} attributes`);
          store.attrs[attr] = res.data;
          return res;
        })
        .catch(err => {
          console.log(`   ❌  ${env.API}attrs/${attr} errored with code ${err.response.status}`);
          return Promise.reject(err);
        }));

      Promise.all(promises).then(start);

    });

}
