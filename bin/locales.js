#! /usr/bin/env node

const shell = require("shelljs");

const path = require("path");
const config = path.join(__dirname, "i18next-scanner.config.js");

shell.exec(`i18next-scanner --config ${config} '{app,src,node_modules/datawheel-canon/src}/**/*.{html,js,jsx}'`, code => {
  shell.echo("");
  shell.exit(code);
});
