#! /usr/bin/env node

const shell = require("shelljs");
const locales = process.env.CANON_LANGUAGES || "en";

shell.exec(`i18next app -r -l ${ locales } -n canon -p "i18nKey=\\"([^\\"]+)\\"|t\\(\\"([^\\"]+)\\"" -o ./locales`, code => {
  shell.exit(code);
});
