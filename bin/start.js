#! /usr/bin/env node

const shell = require("shelljs");

process.env.NODE_ENV = "production";

if (!shell.test("-f", `${process.cwd()}/index.js`)) shell.exec("canon-build");
shell.exec(`node ${process.cwd()}/index.js`);
