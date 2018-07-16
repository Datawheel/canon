const ProgressPlugin = require("webpack/lib/ProgressPlugin"),
      Sequelize = require("sequelize"),
      axios = require("axios"),
      bodyParser = require("body-parser"),
      chalk = require("chalk"),
      cookieParser = require("cookie-parser"),
      cookieSession = require("cookie-session"),
      express = require("express"),
      fs = require("fs"),
      gzip = require("compression"),
      helmet = require("helmet"),
      path = require("path"),
      readline = require("readline"),
      shell = require("shelljs"),
      webpack = require("webpack"),
      yn = require("yn");

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.CANON_PORT || 3300;
const ATTRS = process.env.CANON_ATTRS;
const API = process.env.CANON_API;

const dbName = process.env.CANON_DB_NAME;
const dbUser = process.env.CANON_DB_USER;
const dbHost = process.env.CANON_DB_HOST || "127.0.0.1";
const dbPw = process.env.CANON_DB_PW || null;

const opbeatApp = process.env.CANON_OPBEAT_APP;
const opbeatOrg = process.env.CANON_OPBEAT_ORG;
const opbeatToken = process.env.CANON_OPBEAT_TOKEN;

const logins = process.env.CANON_LOGINS || false;

const appDir = process.cwd();
const appPath = path.join(appDir, "app");
const {name} = JSON.parse(shell.cat(path.join(appDir, "package.json")));
const staticPath = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static");

const canonPath = name === "datawheel-canon" ? appDir : path.join(appDir, "node_modules/datawheel-canon/");

function resolve(file) {

  const fullPath = path.join(appPath, file);

  try {
    require.resolve(fullPath);
    const contents = shell.cat(fullPath);
    if (contents.includes("module.exports")) {
      shell.echo(`${file} imported from app directory (Node)`);
      return require(fullPath);
    }
    else if (contents.includes("export default")) {
      const tempPath = `${shell.tempdir()}${file.replace(/\//g, "-")}.js`;
      new shell.ShellString(contents.replace("export default", "module.exports ="))
        .to(tempPath);
      shell.echo(`${file} imported from app directory (ES6)`);
      return require(tempPath);
    }
    else {
      shell.echo(`${file} exists, but does not have a default export`);
      return false;
    }
  }
  catch (e) {
    shell.echo(`${file} does not exist in .app/ directory, using defaults`);
    return false;
  }

}

const LANGUAGE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "canon";
const LANGUAGES = process.env.CANON_LANGUAGES || "canon";

shell.echo(chalk.bold("\n\n 📂  Gathering Resources\n"));
const store = resolve("store.js") || {};
store.env = {
  CANON_API: API,
  CANON_ATTRS: ATTRS,
  CANON_LANGUAGES: LANGUAGES,
  CANON_LANGUAGE_DEFAULT: LANGUAGE_DEFAULT,
  CANON_LOGINS: logins,
  CANON_LOGLOCALE: process.env.CANON_LOGLOCALE,
  CANON_LOGREDUX: process.env.CANON_LOGREDUX,
  CANON_PORT: PORT,
  NODE_ENV
};

const headerConfig = resolve("helmet.js") || {};

shell.cp(path.join(appDir, "node_modules/normalize.css/normalize.css"), path.join(staticPath, "assets/normalize.css"));

const blueprintInput = path.join(appDir, "node_modules/@blueprintjs/core/");
const blueprintOutput = path.join(staticPath, "assets/blueprint/");
shell.mkdir("-p", path.join(blueprintOutput, "dist"));
shell.cp(path.join(blueprintInput, "dist/blueprint.css"), path.join(blueprintOutput, "dist/blueprint.css"));
shell.cp("-r", path.join(blueprintInput, "resources"), path.join(blueprintOutput, "resources"));

const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nMiddleware = require("i18next-express-middleware");

const lngDetector = new i18nMiddleware.LanguageDetector();
fs.readdirSync(path.join(canonPath, "src/i18n/detection/"))
  .filter(file => file && file.indexOf(".") !== 0)
  .forEach(file => {
    lngDetector.addDetector(require(path.join(canonPath, "src/i18n/detection/", file)));
  });

i18n
  .use(Backend)
  .use(lngDetector)
  .init({

    fallbackLng: LANGUAGE_DEFAULT,
    lng: LANGUAGE_DEFAULT,
    preload: LANGUAGES ? LANGUAGES.split(",") : LANGUAGE_DEFAULT,
    whitelist: LANGUAGES ? LANGUAGES.split(",") : LANGUAGE_DEFAULT,

    // have a common namespace used around the full app
    ns: [name],
    defaultNS: name,

    debug: process.env.NODE_ENV !== "production" ? yn(process.env.CANON_LOGLOCALE) : false,

    backend: {
      loadPath: path.join(appDir, "locales/{{lng}}/{{ns}}.json"),
      jsonIndent: 2
    },

    detection: {
      order: ["domain", "query", "path", "header"]
    }

  });

async function start() {

  shell.echo(chalk.bold("\n\n 🌐  Running Express Server\n"));
  shell.echo(`Environment: ${NODE_ENV}`);
  shell.echo(`Port: ${PORT}`);

  const app = express();

  app.set("port", PORT);
  app.set("trust proxy", "loopback");
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));
  app.use(express.static(staticPath));
  app.use(i18nMiddleware.handle(i18n));

  const secret = process.env.CANON_SESSION_SECRET || name;
  const maxAge = process.env.CANON_SESSION_TIMEOUT || 60 * 60 * 1000; // one hour
  app.use(cookieSession({maxAge, name, secret}));

  if (dbName && dbUser) {

    const db = new Sequelize(dbName, dbUser, dbPw,
      {
        host: dbHost,
        dialect: "postgres",
        define: {timestamps: true},
        logging: () => {}
      }
    );

    app.set("db", db);

  }
  shell.echo(`Database: ${ dbHost && dbUser ? `${dbUser}@${dbHost}` : "NONE" }`);

  let dbFolder = false;
  if (dbName && dbUser) {
    dbFolder = path.join(appDir, "db/");
    let modelCount = 0;
    if (shell.test("-d", dbFolder)) {
      const {db} = app.settings;

      fs.readdirSync(dbFolder)
        .filter(file => file && file.indexOf(".") !== 0)
        .forEach(file => {
          const model = db.import(path.join(dbFolder, file));
          db[model.name] = model;
          modelCount++;
        });

    }
    shell.echo(`Custom DB Models: ${modelCount}`);
  }

  if (logins) {

    const passport = require("passport");
    app.use(passport.initialize());
    app.use(passport.session());

    app.set("passport", passport);
    app.set("social", []);
    require(path.join(canonPath, "src/auth/auth"))(app);
    store.social = app.settings.social;
    store.mailgun = app.settings.mailgun || false;
    store.legal = {
      privacy: process.env.CANON_LEGAL_PRIVACY || false,
      terms: process.env.CANON_LEGAL_TERMS || false
    };

    const {db} = app.settings;
    if (!db.models.users) {
      db.users = db.import(path.join(canonPath, "src/db/users.js"));
    }

  }
  shell.echo(`User Authentication: ${ logins ? "ON" : "OFF" }`);

  if (dbFolder && shell.test("-d", dbFolder)) {

    const {db} = app.settings;

    Object.keys(db).forEach(modelName => {
      if ("associate" in db[modelName]) db[modelName].associate(db);
    });

  }

  const cacheFolder = path.join(appDir, "cache/");
  const cache = {};
  let caches = 0;
  if (shell.test("-d", cacheFolder)) {
    const promises = [];
    fs.readdirSync(cacheFolder)
      .filter(file => file && file.indexOf(".") !== 0)
      .forEach(file => {
        caches++;
        const cacheName = file.split(".")[0];
        const promise = require(path.join(cacheFolder, file))(app);
        promises.push(Promise.all([cacheName, promise]));
      });
    const res = await Promise.all(promises);
    res.forEach(([title, data]) => cache[title] = data);
  }
  shell.echo(`Caches: ${caches}`);
  app.set("cache", cache);

  const apiFolder = path.join(appDir, "api/");
  let routes = 0;
  if (shell.test("-d", apiFolder)) {
    fs.readdirSync(apiFolder)
      .filter(file => file && file.indexOf(".") !== 0)
      .forEach(file => {
        routes++;
        return require(path.join(apiFolder, file))(app);
      });
  }
  shell.echo(`API Routes: ${routes}`);

  if (NODE_ENV === "production" && opbeatApp && opbeatOrg && opbeatToken) {
    const opbeat = require("opbeat").start({
      appId: opbeatApp,
      organizationId: opbeatOrg,
      secretToken: opbeatToken
    });
    app.use(opbeat.middleware.express());
    shell.echo("Opbeat Initialized");
  }

  const App = require(path.join(staticPath, "assets/server"));

  if (NODE_ENV === "development") {

    shell.echo(chalk.bold("\n\n 🔷  Bundling Client Webpack\n"));

    const webpackDevConfig = require(path.join(canonPath, "webpack/webpack.config.dev-client"));
    const compiler = webpack(webpackDevConfig);

    compiler.apply(new ProgressPlugin((percentage, msg, current, active, modulepath) => {
      if (process.stdout.isTTY && percentage < 1) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        modulepath = modulepath ? ` …${modulepath.substr(modulepath.length - 30)}` : "";
        current = current ? ` ${current}` : "";
        active = active ? ` ${active}` : "";
        process.stdout.write(`${(percentage * 100).toFixed(0)}% ${msg}${current}${active}${modulepath} `);
      }
      else if (percentage === 1) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
      }
    }));

    app.use(require("webpack-dev-middleware")(compiler, {
      logLevel: "silent",
      publicPath: webpackDevConfig.output.publicPath
    }));
    app.use(require("webpack-hot-middleware")(compiler));

  }

  if (NODE_ENV === "production") {
    app.use(gzip());
    const FRAMEGUARD = yn(process.env.CANON_HELMET_FRAMEGUARD);
    app.use(helmet({frameguard: FRAMEGUARD === void 0 ? false : FRAMEGUARD}));
  }

  app.get("*", App.default(store, headerConfig));

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
