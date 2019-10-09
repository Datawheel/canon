#! /usr/bin/env node

const {title} = require("./logging.js"),
      babel = require("@babel/core"),
      chalk = require("chalk"),
      path = require("path"),
      shell = require("shelljs"),
      webpack = require("webpack");

const staticFolder = process.env.CANON_STATIC_FOLDER || "static";
const staticPath = path.join(process.cwd(), staticFolder);

shell.rm("-rf", path.join(staticPath, "assets/"));
shell.mkdir("-p", path.join(staticPath, "assets/"));

title("Bundling Production Webpack", "🔷");
const webpackDevConfig = require(path.join(__dirname, "../webpack/prod.js"));
webpack(webpackDevConfig, () => {

  title("Generating index.js", "📒");
  let {code} = babel.transformFileSync(`${__dirname}/server/index.js`, {
    ignore: [staticFolder],
    presets: [
      ["@babel/preset-env", {targets: {node: "current"}}]
    ]
  });

  code = code
    .replace(/process\.cwd\(\)/g, "__dirname")
    .replace("process.env.NODE_ENV", "\"production\"");

  new shell.ShellString(code).to(`${process.cwd()}/index.js`);
  shell.echo(`File created: ${chalk.bold(`${process.cwd()}/index.js\n`)}`);
  shell.exit(0);

});
