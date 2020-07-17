const Sequelize = require("sequelize");
const log = require("./logger");

module.exports = hydrateModels;

/**
 * Creates a new sequelize connection, and imports the needed models into it.
 */
async function hydrateModels(options) {
  const dbConnection = options.db ||
    `postgresql://${options["db-user"]}:${options["db-pass"]}@${options["db-host"]}/${options["db-name"]}`;
  log.write(`Database Connection: ${dbConnection}`);

  log.write("Creating new sequelize instance...");
  const sequelize = new Sequelize(dbConnection, {
    logging: false,
    operatorsAliases: false
  });
  log.overwrite("Creating new sequelize instance... SUCCESS");

  log.write("Testing connection...");
  await sequelize.authenticate();
  log.overwrite("Testing connection... SUCCESS");

  log.write("Retrieving ProfileMeta and Search models...");
  const ProfileMeta = sequelize.import("../../src/db/profile_meta");
  const Search = sequelize.import("../../src/db/search");
  log.overwrite("Retrieving ProfileMeta and Search models... SUCCESS");

  return {
    ProfileMeta,
    Search
  };
}
