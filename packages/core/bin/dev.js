#! /usr/bin/env node

const {title} = require("./logging"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack");

title("Bundling Server Webpack", "🔷");

process.env.NODE_ENV = "development";
const appDir = process.cwd();
const staticFolder = process.env.CANON_STATIC_FOLDER || "static";
const staticPath = path.join(appDir, staticFolder);
const canonPath = require.resolve("@datawheel/canon-core");
const started = false;

shell.rm("-rf", path.join(staticPath, "assets/"));
shell.mkdir("-p", path.join(staticPath, "assets/"));

const webpackDevConfig = require(path.join(__dirname, "../webpack/dev-server.js"));
const compiler = webpack(webpackDevConfig);

compiler.watch({}, (err, stats) => {

  if (err) console.error(err);
  stats.compilation.errors.forEach(e => {
    console.error("\n\n 🛑  SERVER WEBPACK ERROR\n");
    console.error(e);
  });
  stats.compilation.warnings.forEach(e => {
    console.warn("\n\n ⚠️  SERVER WEBPACK ERROR\n");
    console.warn(e);
  });

  // const fs = require("fs");
  // fs.writeFileSync(path.join(process.cwd(), "stats.json"), JSON.stringify(stats.toJson("verbose")));
  shell.exit(0);

  // if (!shell.test("-f", path.join(staticPath, "assets/server.js"))) {
  //   console.error("\n\n 🛑  SERVER WEBPACK ERROR\n");
  //   console.error("Unable to build server.js");
  //   shell.exit(1);
  // }
  // else if (!started) {
  //   started = true;
  //   shell.exec(`node ${path.join(canonPath, "../../bin/server/index.js")}`);
  // }

});
