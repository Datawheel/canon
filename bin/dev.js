#! /usr/bin/env node

const ProgressPlugin = require("webpack/lib/ProgressPlugin"),
      chalk = require("chalk"),
      nodemon = require("nodemon"),
      path = require("path"),
      readline = require("readline"),
      shell = require("shelljs"),
      webpack = require("webpack");

process.env.NODE_ENV = "development";
const {name} = JSON.parse(shell.cat("package.json"));
const appDir = process.cwd();
const canonPath = name === "datawheel-canon" ? appDir : path.join(appDir, "node_modules/datawheel-canon/");
let started = false;

shell.rm("-rf", path.join(appDir, "static/assets/"));
shell.mkdir("-p", path.join(appDir, "static/assets/"));

shell.echo(chalk.bold("\n 🔷  Bundling Server Webpack\n"));

const webpackDevConfig = require(path.join(__dirname, "../webpack/webpack.config.dev-server"));
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
  else if (percentage === 1 && !started) {

    started = true;
    nodemon({
      watch: [
        "api/**/*.js",
        "db/**/*.js"
      ],
      verbose: true,
      exec: `node ${path.join(canonPath, "bin/server.js")}`
    })
      .on("quit", () => {
        process.exit();
      });
  }

}));

compiler.watch({}, (err, stats) => {
  if (err) console.error(err);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  shell.echo(`webpack built ${stats.compilation.hash} in ${stats.endTime - stats.startTime}ms`);
  stats.compilation.errors.forEach(e => {
    console.error("\n\n 🛑  SERVER WEBPACK ERROR\n");
    console.error(e);
  });
  if (stats.compilation.errors.length) shell.exit(1);
  stats.compilation.warnings.forEach(e => {
    console.warn("\n\n ⚠️  SERVER WEBPACK ERROR\n");
    console.warn(e);
  });
  if (!shell.test("-f", "./static/assets/server.js")) {
    console.error("\n\n 🛑  SERVER WEBPACK ERROR\n");
    console.error("Unable to build server.js");
    shell.exit(1);
  }
});
