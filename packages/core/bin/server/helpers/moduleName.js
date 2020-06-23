/**
    Extracts canon module name from a filepath.
*/
module.exports = function moduleName(path) {
  const moduleRegex = /canon\-([A-z]+)/g;
  const exec = moduleRegex.exec(path);
  return exec ? exec[1] : false;
};
