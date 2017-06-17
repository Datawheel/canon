#! /usr/bin/env node

const nodemon = require("nodemon");

process.env.NODE_ENV = "development";
process.env.DIR = __dirname;

nodemon({
  watch: [
    "app/**/*.js",
    "bin/**/*.js",
    "src/**/*.js",
    "src/*.jsx",
    "webpack/**/*.js"
  ],
  verbose: true,
  exec: "clear && node $DIR/build.dev.js && node $DIR/server.js"
})
.on("quit", () => {
  process.exit();
});
