#!/usr/bin/env node

const getopts = require("getopts");

/**
 * @typedef WarmupCliOptions
 * @property {string[]} _ The list of string operands passed by the user.
 * The first one is the subscript that will be executed.
 * @property {string} base The root url to use as template in the generation.
 * @property {boolean} help A flag to show the manual if the user needs it.
 * @property {string} pass The password in case of needing basic authentication.
 * @property {string} threads The number of concurrent connections to work with.
 * @property {string} user The username in case of needing basic authentication.
 */

const options = getopts(process.argv.slice(2), {
  boolean: ["help"],
  string: ["base", "locale", "pass", "threads", "user"],
  alias: {
    base: "b",
    help: "h",
    pass: "p",
    threads: "t",
    user: "u"
  }
});

const actionMap = {
  scan: () => require("./cliScan"),
  stress: () => require("./cliStress")
};

cli(options);

/**
 * Main CLI router function for the warmup command
 *
 * @param {WarmupCliOptions} options
 */
async function cli(options) {
  if (options.help || options._.includes("help")) {
    console.log(`Canon CMS / Warmup script
Usage: npx canon-cms-warmup <command> [args]

Commands:
    help    Shows this information.
    scan    Inits a scan of all available routes in the installed CMS.
    stress  Work in progress.

Arguments:
    -b, --base      The root url to use as template in the generation.
                    Use ":profile" for the profile name, and ":page" for the page slug.
    -h, --help      Shows this information.
    -p, --pass      The password in case of needing basic authentication.
    -t, --threads   The number of concurrent connections to work with. Default: 2.
    -u, --user      The username in case of needing basic authentication.

Environment variables:
    The following parameters are needed to connect to the database and get the
    needed meta info from profiles and search options:

    CANON_CMS_DB_USER         The username to connect to the database.
    CANON_CMS_DB_PSWD         The password to connect to the database, if needed.
    CANON_CMS_DB_HOST         The host and port where to connect to the database.
                              Defaults to "localhost:5432".
    CANON_CMS_DB_NAME         The name of the database where the info is stored.
    CANON_CMS_DB_CONNECTION   The full connection URI string to connect to the database.
                              Format is "engine://dbUser:dbPswd@dbHost/dbName".
                              If this variable is set, the previous ones are ignored.
`);
    process.exit(0);
  }

  const key = options._[0] || "scan";

  const actionWrapper = actionMap[key];
  if (typeof actionWrapper === "function") {
    const action = actionWrapper();
    await action(options).catch(err => {
      console.error(`\nError during execution of "${key}" script:`, err);
    });
    process.exit(0);
  }

  throw new Error(`Command "${key}" is not a valid warmup action.`);
}
