const path = require("path"),
      shell = require("shelljs");

/**
 * @name resolve
 * @desc Uses require.resolve to detect if a file is present.
 * @param {String} prefix
 * @param {String} file
*/
module.exports = function resolve(prefix, file) {

  const fullPath = path.join(prefix, file);
  const dir = fullPath.includes("/app/") ? ".app/ directory" : fullPath.includes("/@datawheel/canon-") ? "canon-core source" : "custom directory";
  delete require.cache[fullPath];

  try {

    require.resolve(fullPath);
    const contents = shell.cat(fullPath);

    if (contents.includes("module.exports")) {
      shell.echo(`${file} imported from ${dir} (Node)`);
      return require(fullPath);
    }
    else if (contents.includes("export default")) {

      const tempPath = path.join(shell.tempdir(), `${file.replace(/\//g, "-")}`);
      new shell.ShellString(contents.replace("export default", "module.exports ="))
        .to(tempPath);

      shell.echo(`${file} imported from ${dir} (ES6)`);
      const tempRequire = require.resolve(tempPath);
      delete require.cache[tempRequire];
      return require(tempPath);

    }
    else {
      shell.echo(`${file} exists, but does not have a default export`);
      return false;
    }

  }
  catch (e) {
    shell.echo(`${file} does not exist in ${dir}, using defaults`);
    return false;
  }

};
