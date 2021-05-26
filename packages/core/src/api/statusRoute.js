const path = require("path");

module.exports = function(app) {

  const {
    CANON_API
  } = process.env;

  const rootPath = process.cwd();

  const packageFilePath = path.join(rootPath, "package.json");
  const packageFile = require(packageFilePath);

  const packageLockFilePath = path.join(rootPath, "package-lock.json");
  const packageLockFile = require(packageLockFilePath);

  app.get("/api/status/core", (req, res) => {

    const response = {
      error: false,
      msg: `Canon CORE is alive in ${CANON_API}/api/status/core`,
      required: {},
      installed: {}
    };

    if (packageFile) {
      response.required.version = packageFile.dependencies["@datawheel/canon-core"];
      // response.required.dependencies = packageFile.dependencies;
    }

    if (packageLockFile) {
      response.installed.version = packageLockFile.dependencies["@datawheel/canon-core"].version;
      // response.installed.dependencies = packageLockFile.dependencies["@datawheel/canon-core"].dependencies;
    }

    // TODO: add relevant validations here

    res.json(response);

  });

};
