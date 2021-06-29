#!/usr/bin/env node

const getopts = require("getopts");

const title = "Canon CMS / Warmup script\n";

const helpText = `${title}
Usage: npx canon-cms-warmup [command] [args]

Available commands are "scan" and "list".
If the command is not set, the script will execute the "scan" command.

Commands:
    scan    The "scan" command checks the available pages in the available
            profiles, and run the tests on each page.
            It has 2 modes: the "run" mode and the "retry" mode. The presence
            of the --input argument determines which mode the script will run.

            In run mode, the script needs to connect to the database and
            retrieve the items the profiles are built with, then sets the
            additional parameters.
                Required : base, db[-props]

            In retry mode, the script will use the results.json file generated
            by a previous run. All the parameters were saved inside, so passing
            them again is not needed.
                Required : input

    list    The "list" command is a reduced version of the scan command.
            Instead of generating the URLs, loading, and executing tests on
            them, it just generates the URLs and saves them in a file.
            This file can later be used in other tools, like siege.
                Required : base, db[-props]

Arguments:
    -b, --base      The root url to use as template in the generation.
                    These variables will be replaced:
                    - ':profile' for the profile name
                    - ':page' for the page slug
    -d, --debug     Prints some extra variables for debugging purposes.
    -H, --header    Set a header for all requests. Multiple headers are allowed
                    but each must be preceeded by the flag, like in curl.
                    The 'Host' header can't be modified.
    -h, --help      Shows this information.
                    This parameter must be used once for each "key: value" combo.
    -i, --input     The path to the 'results.json' file of the previous run.
    -o, --output    The path to the folder where the reports will be saved.
                    Defaults to './cms_warmup_YYYYMMDDhhmmss'.
    -p, --password  The password in case of needing basic authentication.
        --profile   A comma-separated string with the profiles that should be loaded.
                    If omitted or empty, all available profiles will be used.
    -t, --timeout   Time limit to consider a page load failed, in seconds.
    -u, --username  The username in case of needing basic authentication.
        --db-host   The host and port where to connect to the database.
                    Defaults to "localhost:5432".
        --db-name   The name of the database where the info is stored.
        --db-user   The username to connect to the database.
        --db-pass   The password to connect to the database, if needed.
        --db        The full connection URI string to connect to the database.
                    Format is "engine://dbUser:dbPswd@dbHost/dbName".
                    If this variable is set, the previous ones are ignored.
    -w, --workers   The number of concurrent connections to work with. Default: 2
`;

/**
 * @typedef WarmupCliOptions
 * @property {string[]} _ The list of string operands passed by the user.
 * The first one is the subscript that will be executed.
 * @property {string} base The root url to use as template in the generation.
 * @property {boolean} debug Prints some extra variables for debugging purposes.
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
 * @property {string} timeout Time limit to consider a page load failed.
 * @property {string} username The username in case of needing basic authentication.
 * @property {string} workers The number of concurrent connections to work with.
 */

const options = getopts(process.argv.slice(2), {
  alias: {
    base: "b",
    debug: "d",
    header: "H",
    help: "h",
    input: "i",
    output: "o",
    password: "p",
    timeout: "t",
    username: "u",
    verbose: "v",
    workers: "w"
  },
  default: {
    "db-host": "localhost:5432",
    "header": [],
    "output": `./cms_warmup_${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`,
    "timeout": 20,
    "workers": "2"
  },
  boolean: ["debug", "help", "verbose"],
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
    "timeout",
    "username",
    "workers"
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
  }
  else {
    console.log(title);

    if (options.debug) {
      console.debug("Options:", options);
    }

    if (options._.includes("list")) {
      const list = require("./list");
      await list(options);
    }
    else {
      const scan = require("./cluster");
      await scan(options);
    }
  }
}
