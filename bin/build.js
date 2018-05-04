#! /usr/bin/env node

const babel = require("babel-core"),
      chalk = require("chalk"),
      path = require("path"),
      shell = require("shelljs");

const staticFolder = process.env.CANON_STATIC_FOLDER || "static";
const staticPath = path.join(process.cwd(), staticFolder);

process.env.NODE_ENV = "production";

shell.rm("-rf", path.join(staticPath, "assets/"));
shell.mkdir("-p", path.join(staticPath, "assets/"));

shell.echo(chalk.bold("\n\n 🔷  Bundling Production Webpack\n"));
shell.exec(`webpack --progress --colors --hide-modules --config ${__dirname}/../webpack/webpack.config.prod.js`);

shell.echo(chalk.bold("\n\n 📒  Generating index.js\n"));
let {code} = babel.transformFileSync(`${__dirname}/server.js`, {
  ignore: [staticFolder],
  presets: [
    ["env", {targets: {node: "current"}}],
    "stage-0"
  ]
});
code = code.replace(/process\.cwd\(\)/g, "__dirname");
new shell.ShellString(code).to(`${process.cwd()}/index.js`);
shell.echo(`File created: ${chalk.bold(`${process.cwd()}/index.js\n`)}`);
