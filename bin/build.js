#! /usr/bin/env node

const chalk = require("chalk"),
      shell = require("shelljs");

process.env.NODE_ENV = "production";

shell.echo(chalk.bold("\n\n 🔷  Bundling Production Webpack\n"));
shell.exec(`webpack --progress --colors --hide-modules --config ${__dirname}/../webpack/webpack.config.prod.js`);

shell.echo(chalk.bold("\n\n 📒  Babelifying Server Code\n"));
shell.exec(`babel --presets env,stage-0 --ignore static ${__dirname}/server.js -o ${process.cwd()}/index.js`);
