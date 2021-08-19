#! /usr/bin/env node

/* Imports */
const axios = require("axios");
const getopts = require("getopts");
const loadModels = require("../translation/loadModels");
const Sequelize = require("sequelize");

/* DB */
const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
const db = new Sequelize(name, user, pw, {host, dialect: "postgres", operatorsAliases: false, define: {timestamps: true}, logging: () => {}});

const helpText = `Canon CMS / Search Ingestion Script
Usage: npx canon-cms-ingest <command> [args]

*** Remember, the CMS server must be running! ***

Commands:
    help      Shows this information.
    list      List profiles and ids
    ingest    Runs a translation operation
              - Required: profile

Arguments:
    -h, --help      Shows this information.
    -p, --profile   The profile id to ingest
`;

/** */
async function doIngest(options) {
  const {
    profile
  } = options;

  console.log("Ingestion Complete.");
  process.exit(0);
}

const options = getopts(process.argv.slice(2), {
  alias: {
    help: "h",
    profile: "p"
  },
  default: {
    source: process.env.CANON_LANGUAGE_DEFAULT
  }
});

const action = options._[0] || "run";

if (options.help) {
  console.log(helpText);
  process.exit(0);
}

if (action === "run") {
  if (!options.target || !options.profile || !options.base) {
    console.log("Missing parameters! (try --help)");
  }
  else {
    doIngest(options);
  }
}
