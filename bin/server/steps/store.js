const path = require("path"),
      shell = require("shelljs");

let everDetect = false;

module.exports = function(config) {

  const {NODE_ENV, paths} = config;
  const {appPath, serverPath} = paths;

  const resolve = require(path.join(serverPath, "helpers/resolve")),
        title = require(path.join(serverPath, "helpers/title"));

  title(`${everDetect ? "Re-initializing" : "Initializing"} Redux Store`, "🏪");
  everDetect = true;

  const userStore = resolve(appPath, "store.js");
  const store = userStore || {};
  const LANGUAGE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "canon";
  const LANGUAGES = process.env.CANON_LANGUAGES || LANGUAGE_DEFAULT;
  store.env = {
    CANON_API: process.env.CANON_API || "http://localhost:3300",
    CANON_LANGUAGES: LANGUAGES,
    CANON_LANGUAGE_DEFAULT: LANGUAGE_DEFAULT,
    CANON_LOGINS: process.env.CANON_LOGINS || false,
    CANON_LOGLOCALE: process.env.CANON_LOGLOCALE,
    CANON_LOGREDUX: process.env.CANON_LOGREDUX,
    CANON_PORT: process.env.CANON_PORT || 3300,
    NODE_ENV
  };

  Object.keys(process.env)
    .forEach(key => {
      if (key.startsWith("CANON_CONST_")) {
        store.env[key.replace("CANON_CONST_", "")] = process.env[key];
      }
    });

  config.store = store;
  shell.echo("redux store:", store);
  return {files: userStore ? [path.join(appPath, "store.js")] : []};

};
