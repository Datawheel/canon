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
      notifier = require("node-notifier"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack"),
      yn = require("yn");

const {name} = JSON.parse(shell.cat("package.json"));

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.CANON_PORT || 3300;
const ATTRS = process.env.CANON_ATTRS;
const API = process.env.CANON_API;

const dbName = process.env.CANON_DB_NAME;
const dbUser = process.env.CANON_DB_USER;
const dbHost = process.env.CANON_DB_HOST || "127.0.0.1";
const dbPw = process.env.CANON_DB_PW || null;

const logins = process.env.CANON_LOGINS || false;

const appDir = process.cwd();
const appPath = path.join(appDir, "app");

const canonPath = name === "datawheel-canon" ? appDir : path.join(appDir, "node_modules/datawheel-canon/");

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

const LANGUAGE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "en";
const LANGUAGES = process.env.CANON_LANGUAGES || "en";

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

const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nMiddleware = require("i18next-express-middleware");

shell.cp(path.join(appDir, "node_modules/normalize.css/normalize.css"), path.join(appDir, "static/assets/normalize.css"));
const blueprintInput = path.join(appDir, "node_modules/@blueprintjs/core/");
const blueprintOutput = path.join(appDir, "static/assets/blueprint/");
shell.rm("-r", blueprintOutput);
shell.mkdir(blueprintOutput);
shell.mkdir(path.join(blueprintOutput, "dist"));
shell.cp(path.join(blueprintInput, "dist/blueprint.css"), path.join(blueprintOutput, "dist/blueprint.css"));
shell.cp("-r", path.join(blueprintInput, "resources"), path.join(blueprintOutput, "resources"));

i18n
  .use(Backend)
  .use(i18nMiddleware.LanguageDetector)
  .init({

    fallbackLng: LANGUAGE_DEFAULT,
    lng: LANGUAGE_DEFAULT,
    preload: LANGUAGES ? LANGUAGES.split(",") : LANGUAGE_DEFAULT,

    // have a common namespace used around the full app
    ns: [name],
    defaultNS: name,

    debug: process.env.NODE_ENV !== "production" ? yn(process.env.CANON_LOGLOCALE) : false,

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

  const app = express();

  app.set("port", PORT);
  app.set("trust proxy", "loopback");
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));

  const secret = process.env.CANON_SESSION_SECRET || name;
  const maxAge = process.env.CANON_SESSION_TIMEOUT || 60 * 60 * 1000; // one hour
  app.use(cookieSession({
    name,
    secret,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge
    }
  }));

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
        .filter(file => file.indexOf(".") !== 0)
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

    const {db} = app.settings;
    if (!db.models.users) {

      db.getQueryInterface().createTable("users", {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {is: /^[a-z0-9\_\-]+$/i}
        },
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        name: {type: Sequelize.STRING},
        password: {type: Sequelize.STRING},
        salt: {type: Sequelize.STRING},
        twitter: {type: Sequelize.STRING},
        facebook: {type: Sequelize.STRING},
        instagram: {type: Sequelize.STRING},
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });

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

  const apiFolder = path.join(appDir, "api/");
  let routes = 0;
  if (shell.test("-d", apiFolder)) {
    fs.readdirSync(apiFolder)
      .filter(file => file.indexOf(".") !== 0)
      .forEach(file => {
        routes++;
        return require(path.join(apiFolder, file))(app);
      });
  }
  shell.echo(`API Routes: ${routes}`);

  shell.echo(""); // newline to separate PropType warning
  const App = require(path.join(appDir, "static/assets/server"));
  if (NODE_ENV === "development") {

    shell.echo(chalk.bold("\n\n 🔷  Bundling Client Webpack\n"));

    const webpackDevConfig = require(path.join(canonPath, "webpack/webpack.config.dev-client"));
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

  if (NODE_ENV === "production") {
    app.use(gzip());
    const FRAMEGUARD = yn(process.env.CANON_HELMET_FRAMEGUARD);
    app.use(helmet({frameguard: FRAMEGUARD === void 0 ? false : FRAMEGUARD}));
  }

  app.use(express.static(path.join(appDir, "static")));
  app.use(i18nMiddleware.handle(i18n));

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
