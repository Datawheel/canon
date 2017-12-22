#! /usr/bin/env node

const shell = require("shelljs");

process.env.NODE_ENV = "production";

shell.exec("clear");
shell.exec(`webpack --progress --colors --hide-modules --config ${__dirname}/../webpack/webpack.config.prod.js`);
shell.exec(`babel --presets env,stage-0 --ignore static ${__dirname}/server.js -o ${process.cwd()}/index.js`);
