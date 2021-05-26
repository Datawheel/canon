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

  app.get("/api/status/cms", (req, res) => {

    const response = {
      error: false,
      msg: `Canon CMS is alive in ${CANON_API}/api/status/cms`,
      required: {},
      installed: {}
    };

    if (packageFile) {
      response.required.version = packageFile.dependencies["@datawheel/canon-cms"];
      // response.required.dependencies = packageFile.dependencies;
    }

    if (packageLockFile) {
      response.installed.version = packageLockFile.dependencies["@datawheel/canon-cms"].version;
      // response.installed.dependencies = packageLockFile.dependencies["@datawheel/canon-cms"].dependencies;
    }

    // TODO: add relevant validations here

    res.json(response);

  });

};
