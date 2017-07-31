#! /usr/bin/env node

const shell = require("shelljs");
const locales = process.env.CANON_LANGUAGES || "en";
const {name} = JSON.parse(shell.cat("package.json"));

shell.exec(`i18next app -r -l ${ locales } -n ${name} -p "i18nKey=\\"([^\\"]+)\\"|t\\(\\"([^\\"]+)\\"" -o ./locales`, code => {
  shell.exit(code);
});
