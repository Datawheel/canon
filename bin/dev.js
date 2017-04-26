#! /usr/bin/env node

const nodemon = require("nodemon");

process.env.NODE_ENV = "development";
process.env.DIR = __dirname;

nodemon({
  watch: [
    "app/**/*.js",
    "src/**/*.js"
  ],
  verbose: true,
  exec: "clear && webpack --colors --config $DIR/../webpack/webpack.config.dev-server.js && node $DIR/server.js"
})
.on("start", () => {
  // console.log("nodemon has started app");
})
.on("quit", () => {
  // console.log("nodedmon has quit");
  process.exit();
})
.on("restart", files => {
  if (files) {
    const filePath = files[0].split("/");
    console.log("\n👁️  App restarted due to:", filePath[filePath.length - 1]);
    console.log("\n");
  }
});
