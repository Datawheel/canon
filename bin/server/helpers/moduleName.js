const moduleRegex = /canon\-([A-z]+)\//g;

/**
    Extracts canon module name from a filepath.
*/
module.exports = function moduleName(path) {
  const exec = moduleRegex.exec(path);
  return exec ? exec[1] : false;
};
