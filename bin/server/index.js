/* External Libraries */
const fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

/* Environment Variables */
const NODE_ENV = process.env.NODE_ENV || "development";

/* Meta Information */
// const {name} = JSON.parse(shell.cat(path.join(process.cwd(), "package.json")));
const {name} = require(path.join(process.cwd(), "package.json"));

/* File Directories */
const rootPath = process.cwd();
const appPath = path.join(rootPath, "app");
const staticPath = path.join(rootPath, process.env.CANON_STATIC_FOLDER || "static");
const canonPath = name === "@datawheel/canon-core" ? rootPath : path.join(rootPath, "node_modules/@datawheel/canon-core/");
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
  const modules = [rootPath];
  const moduleFolder = path.join(rootPath, "node_modules/@datawheel/");
  if (shell.test("-d", moduleFolder)) {
    fs.readdirSync(moduleFolder)
      .forEach(folder => {
        const fullPath = path.join(moduleFolder, folder);
        shell.echo(moduleName(fullPath) || folder);
        modules.unshift(path.join(fullPath, "src/"));
      });
  }
  else {
    shell.echo("no canon plugins detected");
  }
  if (name === "@datawheel/canon-core") modules.unshift(path.join(rootPath, "src/"));

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

  shell.cp(path.join(rootPath, "node_modules/normalize.css/normalize.css"), path.join(staticPath, "assets/normalize.css"));

  /* define some globally used internal variables */
  const config = {
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
