#!/usr/bin/env node

const getopts = require("getopts");

const title = "Canon CMS / Warmup script\n";

const helpText = `${title}
Usage: npx canon-cms-warmup <command> [args]

Commands:
    help    Shows this information.
    run     Inits a scan of all available routes in the installed CMS.
            - Required: base, db[-props]
            - Optional: output, profile, threads, username, password
    retry   Reads an outputted file from a previous scan and retries to load
            the failed endpoints.
            - Required: input
            - Optional: output, threads

If command is not set, "run" will be executed.

Arguments:
    -b, --base      The root url to use as template in the generation.
                    Use ":profile" for the profile name, and ":page" for the page slug.
    -h, --help      Shows this information.
    -H, --header    Set a header for all requests.
                    This parameter must be used once for each "key: value" combo.
    -i, --input     The path to the 'results.json' file of the scan to retry.
    -o, --output    The path to the folder where the reports will be saved.
                    Defaults to './cms_warmup_YYYYMMDDhhmmss'.
    -p, --password  The password in case of needing basic authentication.
        --profile   A comma separated string of the profiles that should be loaded.
                    If omitted or empty, all available profiles will be used.
    -t, --threads   The number of concurrent connections to work with. Default: 2.
    -u, --username  The username in case of needing basic authentication.
        --db-host   The host and port where to connect to the database.
                    Defaults to "localhost:5432".
        --db-name   The name of the database where the info is stored.
        --db-user   The username to connect to the database.
        --db-pass   The password to connect to the database, if needed.
        --db        The full connection URI string to connect to the database.
                    Format is "engine://dbUser:dbPswd@dbHost/dbName".
                    If this variable is set, the previous ones are ignored.
`;

/**
 * @typedef WarmupCliOptions
 * @property {string[]} _ The list of string operands passed by the user.
 * The first one is the subscript that will be executed.
 * @property {string} base The root url to use as template in the generation.
 * @property {string} db The full connection URI string to connect to the database.
 * @property {string} db-host The host and port where to connect to the database.
 * @property {string} db-name The name of the database where the info is stored.
 * @property {string} db-pass The password to connect to the database, if needed.
 * @property {string} db-user The username to connect to the database.
 * @property {boolean} help A flag to show the manual if the user needs it.
 * @property {string[]} header A list of header params to add to each request.
 * @property {string} input The path to the file that contains the errored endpoints.
 * @property {string} output The path to the file where to log the errored endpoints.
 * @property {string} password The password in case of needing basic authentication.
 * @property {string} profile A comma separated string of the profiles that should be loaded.
 * @property {string} threads The number of concurrent connections to work with.
 * @property {string} username The username in case of needing basic authentication.
 */

const options = getopts(process.argv.slice(2), {
  alias: {
    base: "b",
    help: "h",
    header: "H",
    input: "i",
    output: "o",
    password: "p",
    threads: "t",
    username: "u",
    verbose: "v"
  },
  default: {
    "db-host": "localhost:5432",
    "header": [],
    "output": `./cms_warmup_${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`,
    "threads": "2"
  },
  boolean: ["help", "verbose"],
  string: [
    "base",
    "db",
    "db-host",
    "db-name",
    "db-pass",
    "db-user",
    "header",
    "input",
    "output",
    "password",
    "profile",
    "threads",
    "username"
  ]
});

cli(options)
  .then(() => {
    process.exit(0);
  }, err => {
    console.error(err);
    process.exit(1);
  });

/**
 * Main CLI router function for the warmup command
 *
 * @param {WarmupCliOptions} options
 */
async function cli(options) {
  if (options.help || options._.includes("help")) {
    console.log(helpText);
    process.exit(0);
  }

  console.log(title);

  const key = options._[0] || "run";

  const actionMap = {
    retry: () => require("./cli_retry"),
    run: () => require("./cli_run")
  };

  const actionWrapper = actionMap[key];
  if (typeof actionWrapper !== "function") {
    throw new Error(`Command "${key}" is not a valid warmup action.`);
  }

  const action = actionWrapper();
  await action(options);
}
