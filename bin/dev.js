#! /usr/bin/env node

const chalk = require("chalk"),
      nodemon = require("nodemon"),
      shell = require("shelljs");

process.env.NODE_ENV = "development";
process.env.CANON_DIR = __dirname;

nodemon({
  watch: [
    "api/**/*.js",
    "app/helmet.js",
    "app/routes.jsx",
    "app/store.js",
    "app/style.yml",
    "app/reducers/index.js",
    "bin/**/*.js",
    "src/**/*.js",
    "src/*.jsx",
    "webpack/**/*.js"
  ],
  verbose: true,
  exec: "node $CANON_DIR/build.dev.js && node $CANON_DIR/server.js"
})
  .on("quit", () => {
    process.exit();
  });
