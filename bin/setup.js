#! /usr/bin/env node

const appDir = process.cwd(),
      path = require("path"),
      shell = require("shelljs");

// adds scripts and meta information to package.json
const pkg = JSON.parse(shell.cat("package.json"));
const canon = JSON.parse(shell.cat(path.join(__dirname, "../package.json")));
pkg.main = "src/index.js";
Object.keys(canon.bin).forEach(script => {
  pkg.scripts[script.split("-")[1]] = script;
});
pkg.scripts.start = "pm2 start index.js -i max";
pkg.scripts.stop = "pm2 delete all";

new shell.ShellString(JSON.stringify(pkg, null, 2)).to("package.json");

// copies over files from bin/scaffold
shell.ls("-AR", path.join(__dirname, "scaffold/")).forEach(fileName => {
  const oldPath = path.join(__dirname, `scaffold/${fileName}`);
  fileName = fileName.replace("dot_", ".");
  const newPath = path.join(appDir, fileName);
  if (shell.test("-d", oldPath)) shell.mkdir("-p", newPath);
  else if (!shell.test("-e", newPath) || fileName.indexOf(".") === 0) {
    const contents = shell.cat(oldPath)
      .replace(/\{\{pkg.name\}\}/g, pkg.name)
      .replace(/\{\{pkg.description\}\}/g, pkg.description);
    new shell.ShellString(contents).to(newPath);
  }
});
