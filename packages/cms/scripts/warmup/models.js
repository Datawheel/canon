const Sequelize = require("sequelize");

const {dbConnection} = require("./consts");

module.exports = hydrateModels;

/**
 * Creates a new sequelize connection, and imports the needed models into it.
 */
async function hydrateModels() {
  console.log("Creating new sequelize instance...");
  const sequelize = new Sequelize(dbConnection, {
    logging: false,
    operatorsAliases: false
  });

  console.log("Retrieving ProfileMeta and Search models...");
  const ProfileMeta = sequelize.import("../../src/db/profile_meta");
  const Search = sequelize.import("../../src/db/search");

  return {
    ProfileMeta,
    Search
  };
}
