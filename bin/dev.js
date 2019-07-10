#! /usr/bin/env node

const {title} = require("./logging"),
      nodemon = require("nodemon"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack");

title("Bundling Server Webpack", "🔷");

process.env.NODE_ENV = "development";
const {name} = JSON.parse(shell.cat("package.json"));
const appDir = process.cwd();
const staticFolder = process.env.CANON_STATIC_FOLDER || "static";
const staticPath = path.join(appDir, staticFolder);
const canonPath = name === "@datawheel/canon-core" ? appDir : path.join(appDir, "node_modules/@datawheel/canon-core/");
let started = false;

shell.rm("-rf", path.join(staticPath, "assets/"));
shell.mkdir("-p", path.join(staticPath, "assets/"));

const webpackDevConfig = require(path.join(__dirname, "../webpack/dev-server.js"));
const compiler = webpack(webpackDevConfig);

compiler.watch({}, (err, stats) => {

  if (err) console.error(err);
  shell.echo(`webpack built server ${stats.compilation.hash} in ${stats.endTime - stats.startTime}ms`);
  stats.compilation.errors.forEach(e => {
    console.error("\n\n 🛑  SERVER WEBPACK ERROR\n");
    console.error(e);
  });
  stats.compilation.warnings.forEach(e => {
    console.warn("\n\n ⚠️  SERVER WEBPACK ERROR\n");
    console.warn(e);
  });

  if (!shell.test("-f", path.join(staticPath, "assets/server.js"))) {
    console.error("\n\n 🛑  SERVER WEBPACK ERROR\n");
    console.error("Unable to build server.js");
    shell.exit(1);
  }
  else if (!started) {

    started = true;
    nodemon({
      watch: [
        "api/**/*.js",
        "cache/**/*.js",
        "db/**/*.js"
      ],
      verbose: true,
      exec: `node ${path.join(canonPath, "bin/server.js")}`
    })
      .on("quit", () => {
        process.exit();
      });

  }
});
