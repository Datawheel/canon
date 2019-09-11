const d3Array = require("d3-array"),
      fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

/**
    Uses require.resolve to detect if a file is present.
*/
module.exports = function readFiles(folder, fileType = "js") {
  return d3Array.merge(fs.readdirSync(folder)
    .filter(file => file && file.indexOf(".") !== 0)
    .map(file => {
      const fullPath = path.join(folder, file);
      if (shell.test("-d", fullPath)) return readFiles(fullPath, fileType);
      else if (file.indexOf(`.${fileType}`) === file.length - 1 - fileType.length) return [fullPath];
      else return [];
    }));
};
