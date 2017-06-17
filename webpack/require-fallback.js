const path = require("path"),
      shell = require("shelljs");

const appPath = path.join(process.cwd(), "app");

module.exports = file => {

  const fullPath = path.join(appPath, file);

  try {
    require.resolve(fullPath);
    shell.echo(`${file} loaded from .app/ directory`);
    return require(fullPath);
  }
  catch (e) {
    shell.echo(`${file} does not exist in .app/ directory, using default`);
    return false;
  }

};
