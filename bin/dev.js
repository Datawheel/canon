#! /usr/bin/env node

const nodemon = require("nodemon");

process.env.NODE_ENV = "development";
process.env.CANON_DIR = __dirname;

nodemon({
  watch: [
    "api/**/*.js",
    "app/**/*.js",
    "bin/**/*.js",
    "src/**/*.js",
    "src/*.jsx",
    "webpack/**/*.js"
  ],
  verbose: true,
  exec: "clear && node $CANON_DIR/build.dev.js && node $CANON_DIR/server.js"
})
.on("quit", () => {
  process.exit();
});
