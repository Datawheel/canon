const {env} = process;

/*
 * Database credentials
 * These env vars should allow the script to access the database where the main
 * CMS info is stored.
 */

/** Database name */
const dbName = env.CANON_CMS_DB_NAME;

/** Database username */
const dbUser = env.CANON_CMS_DB_USER;

/** Database password */
const dbPswd = env.CANON_CMS_DB_PSWD;

/** Database host and port */
const dbHost = env.CANON_CMS_DB_HOST || "localhost:5432";

/** Database connection string */
const dbConnection = env.CANON_CMS_DB_CONNECTION || `postgresql://${dbUser}:${dbPswd}@${dbHost}/${dbName}`;

module.exports = {
  dbConnection,
  dbHost,
  dbName,
  dbPswd,
  dbUser
};
