#!/usr/bin/env node

const path = require("path");
const shell = require("shelljs");

const appRoot = process.cwd();
const scaffoldPath = path.join(__dirname, "scaffold");

const appManifest = shell.test("-e", "package.json")
  ? JSON.parse(shell.cat("package.json"))
  : {};

// copies over files from ./scaffold/
shell.ls("-AR", scaffoldPath).forEach(fileName => {
  const oldPath = path.join(scaffoldPath, fileName);
  const newFileName = fileName.replace("dot_", ".");
  const newPath = path.join(appRoot, newFileName);

  if (shell.test("-d", oldPath)) {
    shell.mkdir("-p", newPath);
  }
  else if (!shell.test("-e", newPath) || newFileName.indexOf(".") === 0) {
    const contents = shell.cat(oldPath)
      .replace(/\{\{pkg.name\}\}/g, appManifest.name)
      .replace(/\{\{pkg.description\}\}/g, appManifest.description);
    new shell.ShellString(contents).to(newPath);
  }
});

// TODO: Merge package.json files if there's one already in cwd
