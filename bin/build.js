#! /usr/bin/env node

const shell = require("shelljs");

process.env.NODE_ENV = "production";

shell.exec(`webpack --colors --config ${__dirname}/../webpack/webpack.config.prod.js`);
shell.exec(`babel --presets es2015,stage-0 --ignore node_modules,static ${__dirname}/server.js -o ${process.cwd()}/index.js`);
