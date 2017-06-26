#! /usr/bin/env node

const shell = require("shelljs");

process.env.CANON_ENV = "production";

shell.exec("clear");
if (!shell.test("-f", `${process.cwd()}/index.js`)) shell.exec("canon-build");
shell.exec("clear");
shell.exec(`node ${process.cwd()}/index.js`);
