#! /usr/bin/env node

const chalk = require("chalk"),
      path = require("path"),
      shell = require("shelljs");

const staticFolder = process.env.CANON_STATIC_FOLDER || "static";
const staticPath = path.join(process.cwd(), staticFolder);

process.env.NODE_ENV = "production";

shell.rm("-rf", path.join(staticPath, "assets/"));
shell.mkdir("-p", path.join(staticPath, "assets/"));

shell.echo(chalk.bold("\n\n 🔷  Bundling Production Webpack\n"));
shell.exec(`webpack --progress --colors --hide-modules --config ${__dirname}/../webpack/webpack.config.prod.js`);

shell.echo(chalk.bold("\n\n 📒  Babelifying Server Code\n"));
shell.exec(`babel --presets env,stage-0 --ignore ${staticFolder} ${__dirname}/server.js -o ${process.cwd()}/index.js`);
shell.sed("-i", /process\.cwd\(\)/g, "__dirname", `${process.cwd()}/index.js`);
