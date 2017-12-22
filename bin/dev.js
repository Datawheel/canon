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

shell.echo(chalk.bold("\n 🔷  Bundling Server Webpack\n"));
// shell.exec(`webpack --progress --colors --hide-modules -w --hot --config ${__dirname}/../webpack/webpack.config.dev-server.js`);

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
  else if (percentage === 1) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    if (!started) {
      process.stdout.write("server webpack built");
      started = true;
      nodemon({
        watch: [
          "api/**/*.js",
          "db/**/*.js"
        ],
        verbose: true,
        exec: `node ${path.join(canonPath), "bin/server.js"}`
      })
        .on("quit", () => {
          process.exit();
        });
    }

  }
}));

compiler.watch({}, () => {});
