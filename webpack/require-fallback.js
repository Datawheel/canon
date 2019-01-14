const fs = require("fs"),
      path = require("path"),
      shell = require("shelljs"),
      yaml = require("js-yaml");

const appPath = path.join(process.cwd(), "app");

module.exports = file => {

  const fullPath = path.join(appPath, file);

  try {
    require.resolve(fullPath);
    const contents = fs.readFileSync(fullPath, "utf8");
    if (process.env.NODE_ENV === "development") shell.echo(`${file} loaded from .app/ directory`);
    return yaml.safeLoad(contents, {json: true});
  }
  catch (e) {
    if (process.env.NODE_ENV === "development") shell.echo(`${file} does not exist in .app/ directory, using default`);
    return false;
  }

};
