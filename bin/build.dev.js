#! /usr/bin/env node

const chalk = require("chalk");
const shell = require("shelljs");
const notifier = require("node-notifier");
const {name} = JSON.parse(shell.cat("package.json"));

notifier.notify({
  title: name,
  message: "Bundling Server Webpack - Please Wait"
});

shell.echo(chalk.bold("\n 🔷  Bundling Server Webpack\n"));
shell.exec(`webpack --progress --colors --hide-modules --config ${__dirname}/../webpack/webpack.config.dev-server.js`);
