const Sequelize = require("sequelize"),
      bodyParser = require("body-parser"),
      chalk = require("chalk"),
      cookieParser = require("cookie-parser"),
      cookieSession = require("cookie-session"),
      d3Array = require("d3-array"),
      express = require("express"),
      fs = require("fs"),
      gzip = require("compression"),
      helmet = require("helmet"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack"),
      yn = require("yn");

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.CANON_PORT || 3300;
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

const canonPath = name === "@datawheel/canon-core" ? appDir : path.join(appDir, "node_modules/@datawheel/canon-core/");

const moduleFolder = path.join(appDir, "node_modules/@datawheel/");
const modules = [];
if (name === "@datawheel/canon-core") modules.push(path.join(appDir, "src/"));
if (shell.test("-d", moduleFolder)) {
  fs.readdirSync(moduleFolder)
    .forEach(folder => {
      modules.push(path.join(moduleFolder, folder, "src/"));
    });
}
modules.push(appDir);

const moduleRegex = /@datawheel\/canon\-([A-z]+)\//g;

/**
 * @name title
 * @param {String} str The string used as the title.
 * @param {String} [icon] An optional Unicode character or Emoji to use in the title.
 */
function title(str, icon = "") {
  shell.echo(chalk.bold(`\n\n${icon.length ? `${icon}  ` : ""}${str}`));
  shell.echo(chalk.gray("\n——————————————————————————————————————————————\n"));
}

/**
    Extracts canon module name from a filepath.
*/
function moduleName(path) {
  const exec = moduleRegex.exec(path);
  return exec ? exec[1] : name;
}

/**
    Uses require.resolve to detect if a file is present.
*/
function resolve(file, prefix = appPath) {

  const fullPath = path.join(prefix, file);
  const dir = prefix === appPath ? ".app/ directory" : prefix === canonPath ? "canon-core source" : "custom directory";

  try {
    require.resolve(fullPath);
    const contents = shell.cat(fullPath);
    if (contents.includes("module.exports")) {
      shell.echo(`${file} imported from ${dir} (Node)`);
      return require(fullPath);
    }
    else if (contents.includes("export default")) {
      const tempPath = path.join(shell.tempdir(), `${file.replace(/\//g, "-")}.js`);
      new shell.ShellString(contents.replace("export default", "module.exports ="))
        .to(tempPath);
      shell.echo(`${file} imported from ${dir} (ES6)`);
      return require(tempPath);
    }
    else {
      shell.echo(`${file} exists, but does not have a default export`);
      return false;
    }
  }
  catch (e) {
    shell.echo(`${file} does not exist in ${dir}, using defaults`);
    return false;
  }

}

/**
    Uses require.resolve to detect if a file is present.
*/
function readFiles(folder, fileType = "js") {
  return d3Array.merge(fs.readdirSync(folder)
    .filter(file => file && file.indexOf(".") !== 0)
    .map(file => {
      const fullPath = path.join(folder, file);
      if (shell.test("-d", fullPath)) return readFiles(fullPath, fileType);
      else if (file.indexOf(`.${fileType}`) === file.length - 1 - fileType.length) return [fullPath];
      else return [];
    }));
}

const LANGUAGE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "canon";
const LANGUAGES = process.env.CANON_LANGUAGES || LANGUAGE_DEFAULT;

title("Gathering Resources", "📂");

const store = resolve("store.js") || {};
store.env = {
  CANON_API: API,
  CANON_LANGUAGES: LANGUAGES,
  CANON_LANGUAGE_DEFAULT: LANGUAGE_DEFAULT,
  CANON_LOGINS: logins,
  CANON_LOGLOCALE: process.env.CANON_LOGLOCALE,
  CANON_LOGREDUX: process.env.CANON_LOGREDUX,
  CANON_PORT: PORT,
  NODE_ENV
};

const canonConfig = require(path.join(process.cwd(), "canon.js"));
const reduxMiddleware = canonConfig.reduxMiddleware || false;

Object.keys(process.env)
  .forEach(key => {
    if (key.startsWith("CANON_CONST_")) {
      store.env[key.replace("CANON_CONST_", "")] = process.env[key];
    }
  });

const headerConfig = resolve("helmet.js") || {};

shell.cp(path.join(appDir, "node_modules/normalize.css/normalize.css"), path.join(staticPath, "assets/normalize.css"));

const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nMiddleware = require("i18next-express-middleware");

const lngDetector = new i18nMiddleware.LanguageDetector();
readFiles(path.join(canonPath, "src/i18n/detection/"))
  .forEach(file => {
    lngDetector.addDetector(require(file));
  });

let namespace = name.split("/");
namespace = namespace[namespace.length - 1];

const i18nConfig = {
  fallbackLng: LANGUAGE_DEFAULT,
  lng: LANGUAGE_DEFAULT,
  preload: LANGUAGES ? LANGUAGES.split(",") : LANGUAGE_DEFAULT,
  whitelist: LANGUAGES ? LANGUAGES.split(",") : LANGUAGE_DEFAULT,
  ns: [namespace],
  defaultNS: namespace,
  debug: process.env.NODE_ENV !== "production" ? yn(process.env.CANON_LOGLOCALE) : false,
  react: {
    wait: true,
    withRef: true
  },
  detection: {
    order: ["domain", "query", "path", "header"]
  }
};

if (LANGUAGE_DEFAULT === "canon") {
  const fallbackResources = resolve("src/i18n/canon.js", canonPath);
  i18nConfig.resources = {canon: {[namespace]: fallbackResources}};
}
else {
  i18n.use(Backend);
  i18nConfig.backend = {
    loadPath: path.join(appDir, "locales/{{lng}}/{{ns}}.json"),
    jsonIndent: 2
  };
}

i18n.use(lngDetector).init(i18nConfig);

/**
    Main server spinup function.
*/
async function start() {

  title("Running Express Server", "🌐");
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

  let dbDetect = false;
  if (dbName && dbUser) {
    for (let i = 0; i < modules.length; i++) {
      const folder = modules[i];
      const dbFolder = path.join(folder, "db/");
      if (shell.test("-d", dbFolder)) {
        if (!dbDetect) {
          dbDetect = true;

          title("Setting up Database Models", "🗄️");

          app.set("db", new Sequelize(dbName, dbUser, dbPw,
            {
              host: dbHost,
              dialect: "postgres",
              define: {timestamps: true},
              logging: () => {},
              operatorsAliases: Sequelize.Op
            }
          ));
          shell.echo(`Database: ${dbUser}@${dbHost}`);
        }
        const module = moduleName(dbFolder);
        const {db} = app.settings;
        readFiles(dbFolder)
          .forEach(file => {
            const model = db.import(file);
            db[model.name] = model;
            shell.echo(`${module}: ${model.name}`);
          });
      }
    }
    if (dbDetect) {
      const {db} = app.settings;
      await db.sync()
        .then(({models}) => {
          const seeds = [];
          Object.keys(models).forEach(async name => {
            const model = models[name];
            const count = await model.count();
            const isEmpty = count === 0;
            // Only populate a table with seed data if it is empty
            if (model.seed && isEmpty) {
              seeds.push(model.bulkCreate(model.seed));
            }
          });
          return Promise.all(seeds);
        })
        .catch(() => {});
      Object.keys(db).forEach(modelName => {
        if ("associate" in db[modelName]) db[modelName].associate(db);
      });
    }
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

    shell.echo("User Authentication: ON");

  }

  const cache = {};
  let cacheDetect = false;
  for (let i = 0; i < modules.length; i++) {
    const folder = modules[i];
    const cacheFolder = path.join(folder, "cache/");
    if (shell.test("-d", cacheFolder)) {
      if (!cacheDetect) {
        cacheDetect = true;
        title("Filling Caches", "📦");
      }
      const module = moduleName(cacheFolder);
      const promises = [];
      readFiles(cacheFolder)
        .forEach(file => {
          const parts = file.replace(/\\/g, "/").split("/");
          const cacheName = parts[parts.length - 1].replace(".js", "");
          const promise = require(file)(app);
          promises.push(Promise.all([cacheName, promise]));
        });
      const res = await Promise.all(promises);
      res.forEach(([title, data]) => {
        cache[title] = data;
        shell.echo(`${module}: ${title}`);
      });
    }
  }
  app.set("cache", cache);

  let apiDetect = false;
  for (let i = 0; i < modules.length; i++) {
    const folder = modules[i];
    const apiFolder = path.join(folder, "api/");
    if (shell.test("-d", apiFolder)) {
      if (!apiDetect) {
        apiDetect = true;
        title("Hooking up API Routes", "📡");
      }
      const module = moduleName(apiFolder);
      readFiles(apiFolder)
        .forEach(file => {
          const parts = file.replace(/\\/g, "/").split("/");
          const apiName = parts[parts.length - 1].replace(".js", "");
          shell.echo(`${module}: ${apiName}`);
          return require(file)(app);
        });
    }
  }

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

    title("Bundling Client Webpack", "🔷");

    const webpackDevConfig = require(path.join(canonPath, "webpack/dev-client.js"));
    const compiler = webpack(webpackDevConfig);

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

  app.get("*", App.default(store, headerConfig, reduxMiddleware));

  app.listen(PORT);

  if (process.send) process.send("ready");

}

start();
