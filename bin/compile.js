#! /usr/bin/env node

const shell = require("shelljs");

process.env.NODE_ENV = "production";

shell.mkdir("-p", `${process.cwd()}/lib`);
shell.exec(`webpack --colors --config ${__dirname}/webpack.config.js`);
shell.exec(`babel --presets es2015,stage-0 --ignore node_modules,static ${process.cwd()}/lib/main.js -o ${process.cwd()}/lib/datawheel-canon.js`);
