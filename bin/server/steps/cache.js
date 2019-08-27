const path = require("path"),
      shell = require("shelljs");

let everDetect = false;

module.exports = async function(config) {

  const {modules, name, paths} = config;
  const {serverPath} = paths;

  const moduleName = require(path.join(serverPath, "helpers/moduleName")),
        readFiles = require(path.join(serverPath, "helpers/readFiles")),
        title = require(path.join(serverPath, "helpers/title"));

  config.cache = {};

  const files = [];
  for (let i = 0; i < modules.length; i++) {
    const folder = modules[i];
    const cacheFolder = path.join(folder, "cache/");
    if (shell.test("-d", cacheFolder)) {
      if (!files.length) {
        title(`${everDetect ? "Re-f" : "F"}illing Caches`, "📦");
        everDetect = true;
      }
      const module = moduleName(cacheFolder) || name;
      const promises = [];
      files.push(cacheFolder);
      readFiles(cacheFolder)
        .forEach(file => {
          const parts = file.replace(/\\/g, "/").split("/");
          const cacheName = parts[parts.length - 1].replace(".js", "");
          const promise = require(file)(config);
          promises.push(Promise.all([cacheName, promise]));
        });
      const res = await Promise.all(promises);
      res.forEach(([title, data]) => {
        config.cache[title] = data;
        shell.echo(`${module}: ${title}`);
      });
    }
  }

  return {files};

};
