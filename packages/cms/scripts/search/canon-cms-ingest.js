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
    run       Runs a translation operation
                - Required: profile

Arguments:
    -p, --profile   The profile id to ingest
`;

/** */
async function doIngest(options) {
  const {
    profile
  } = options;

  console.log("ingesting", profile);

  console.log("Ingestion Complete");
  process.exit(0);
}

/** */
async function doList() {
  console.log("List goes here");
  process.exit(0);
}

const options = getopts(process.argv.slice(2), {
  alias: {
    profile: "p"
  },
  default: {
    source: process.env.CANON_LANGUAGE_DEFAULT
  }
});

const action = options._[0] || "help";

switch (action) {
  case "list":
    doList();
    break;
  case "run":
    if (!options.profile) {
      console.log("Missing profile parameter! (try canon-cms-ingest help)");
      process.exit(0);
    }
    doIngest(options);
    break;
  default:  // includes "help"
    console.log(helpText);
    process.exit(0);
}
