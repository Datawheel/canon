#! /usr/bin/env node

const shell = require("shelljs");

const path = require("path");
const appDir = process.cwd();
const binPath = path.join(appDir, "bin/i18next-scanner.config.js");

shell.exec(`i18next-scanner --config ${binPath} '{app,src,node_modules/datawheel-canon/src}/**/*.{js,jsx}'`, code => {
  shell.echo("");
  shell.exit(code);
});
