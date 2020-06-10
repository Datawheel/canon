/* External Libraries */
const cssnano = require("cssnano"),
      fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

/* Environment Variables */
const NODE_ENV = process.env.NODE_ENV || "development";

/* Meta Information */
// const {name} = JSON.parse(shell.cat(path.join(process.cwd(), "package.json")));
const {dependencies, devDependencies, optionalDependencies, name} = require(path.join(process.cwd(), "package.json"));

/* File Directories */
const rootPath = process.cwd();
const appPath = path.join(rootPath, "app");
const staticPath = path.join(rootPath, process.env.CANON_STATIC_FOLDER || "static");
const canonPath = path.join(require.resolve("@datawheel/canon-core"), "../../");
const serverPath = NODE_ENV === "development" ? __dirname : path.join(canonPath, "bin/server/");
const paths = {appPath, canonPath, rootPath, serverPath, staticPath};

/* Internal Helper Functions */
const moduleName = require(path.join(serverPath, "helpers/moduleName")),
      title = require(path.join(serverPath, "helpers/title"));

/* Build Steps */
const stepCache = require(path.join(serverPath, "steps/cache")),
      stepDb = require(path.join(serverPath, "steps/db")),
      stepRouter = require(path.join(serverPath, "steps/router")),
      stepStore = require(path.join(serverPath, "steps/store"));

/**
    Main server spinup function.
*/
async function start() {

  /* Detects which directories to load server files from ("api/", "db/", etc) */
  title("Detecting Canon Plugins", "🧩");

  let deps = Object.keys(dependencies);
  if (devDependencies) deps = deps.concat(Object.keys(devDependencies));
  if (optionalDependencies) deps = deps.concat(Object.keys(optionalDependencies));
  deps = deps
    .filter((d, i) => d.includes("@datawheel/canon-") && deps.indexOf(d) === i)
    .map(d => {
      shell.echo(moduleName(d) || d);
      return require.resolve(d);
    });

  const modules = deps.concat([rootPath]);
  if (!deps.length) shell.echo("no canon plugins detected");
  if (name.includes("@datawheel/canon-")) modules.unshift(path.join(rootPath, "src/"));

  title("Registering Services", "🛎️");

  const opbeatApp = process.env.CANON_OPBEAT_APP;
  const opbeatOrg = process.env.CANON_OPBEAT_ORG;
  const opbeatToken = process.env.CANON_OPBEAT_TOKEN;
  const opbeat = opbeatApp && opbeatOrg && opbeatToken ? require("opbeat").start({
    appId: opbeatApp,
    organizationId: opbeatOrg,
    secretToken: opbeatToken
  }) : false;
  shell.echo(`Opbeat: ${opbeat ? "Enabled" : "Disabled"}`);

  /* Normalize.css */
  const normalizePath = require.resolve("normalize.css/normalize.css");
  const postcssOpts = {from: normalizePath};
  const cssnanoOpts = {preset: "default"};
  const normalizeCSS = fs.readFileSync(normalizePath);
  const cssnanoResult = await cssnano.process(normalizeCSS, postcssOpts, cssnanoOpts);
  fs.writeFile(path.join(staticPath, "assets/normalize.css"), cssnanoResult.css, err => {
    if (err) throw err;
    shell.echo("Normalize.css minified & saved.");
  });

  /* define some globally used internal variables */
  const config = {
    NODE_ENV,
    modules,
    opbeat,
    name,
    paths
  };

  const {files: storeFiles} = await stepStore(config);
  const {files: dbFiles} = await stepDb(config);
  const {files: cacheFiles} = await stepCache(config);

  const routerInit = stepRouter(config);
  let server = routerInit.server;
  const routerFiles = routerInit.files;

  /** Process to reboot the DB when changes are detected */
  async function rebootDb() {
    await config.db.close();
    await stepDb(config);
  }

  /** Process to reboot the Express API when changes are detected */
  function rebootApi() {
    server.destroy();
    const routerConfig = stepRouter(config);
    server = routerConfig.server;
  }

  const watchFiles = [
    path.join(appPath, "style.yml"),
    ...storeFiles,
    ...cacheFiles,
    ...dbFiles,
    ...routerFiles
  ];

  if (NODE_ENV === "development") {

    const chokidar = require("chokidar");

    chokidar.watch(watchFiles, {ignoreInitial: true})
      .on("all", async(event, path) => {

        if (["change", "add", "unlink"].includes(event)) {

          title(`Change detected: ${path.replace(paths.rootPath, "")}`, "👀️");
          config.change = path;
          delete require.cache[path];

          if (storeFiles.some(f => path.startsWith(f))) {
            stepStore(config);
          }
          else if (cacheFiles.some(f => path.startsWith(f))) {
            await stepCache(config);
          }
          else if (dbFiles.some(f => path.startsWith(f))) {
            await rebootDb();
          }

          rebootApi();

        }

      });

  }

  if (process.send) process.send("ready");

}

start();
