const path = require("path"),
      shell = require("shelljs");

const appDir = process.cwd();
const appPath = path.join(appDir, "app");

module.exports = file => {

  const fullPath = path.join(appPath, file);

  try {
    require.resolve(fullPath);
    const contents = shell.cat(fullPath);
    if (contents.includes("module.exports")) {
      shell.echo(`${file} imported from app directory (Node)`);
      return require(fullPath);
    }
    else if (contents.includes("export default")) {
      const tempPath = `${shell.tempdir()}canon.js`;
      new shell.ShellString(contents.replace("export default", "module.exports ="))
        .to(tempPath);
      shell.echo(`${file} imported from app directory (ES6)`);
      return require(tempPath);
    }
    else {
      shell.echo(`${file} exists, but does not have a default export`);
      return false;
    }
  }
  catch (e) {
    shell.echo(`${file} does not exist in .app/ directory, using defaults`);
    return false;
  }

};
