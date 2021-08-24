#! /usr/bin/env node

/* Imports */
const getopts = require("getopts");
const loadModels = require("../translation/loadModels");
const populateSearch = require("../../src/utils/populateSearch");
const Sequelize = require("sequelize");

/* DB */
const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
const db = new Sequelize(name, user, pw, {host, dialect: "postgres", operatorsAliases: false, define: {timestamps: true}, logging: () => {}});

const helpText = `Canon CMS / Search Ingestion Script
Usage: npx canon-cms-ingest <command> [args]

Commands:
    help      Shows this information.
    list      List dimensions and ids
    run       Runs a search ingest
                - Required: dimension

Arguments:
    -d, --dimension   The dimension id to ingest
    -s, --slugs       Generate new slugs (warning: can update/break permalinks)
    -a, --all         Include members with null values for the given Measure (rarely used)
`;

/** */
async function getModels() {
  console.log("Initializing Models...");
  await loadModels(db, "../../src/db").catch(e => {
    console.log("Failed to load models, exiting...");
    console.log(e);
    process.exit(0);
  });
}

/** */
async function doIngest(options) {
  const {
    dimension,
    slugs,
    all
  } = options;
  await getModels();
  const meta = await db.profile_meta.findOne({where: {id: dimension}}).then(d => d).catch(() => false);
  if (!meta) {
    console.log("Error - Dimension not found. Exiting.");
    process.exit(0);
  }
  const {slug, dimension: dimName, levels, measure, cubeName} = meta;
  const profileData = {dimName, levels, measure, cubeName};
  console.log(`Running populateSearch for ${slug}`);
  await populateSearch(profileData, db, false, slugs, all);
  console.log("Ingestion Complete");
  process.exit(0);
}

/** */
async function doList() {
  await getModels();
  const meta = await db.profile_meta.findAll().then(d => d).catch(() => []);
  let longest = 0;
  const pairs = meta.reduce((acc, d) => {
    d = d.toJSON();
    const pid = d.profile_id;
    if (!acc[pid]) acc[pid] = [];
    const slug = `${d.slug} (${d.dimension}/${d.cubeName})`;
    const {id} = d;
    if (slug.length > longest) longest = slug.length;
    acc[pid].push({slug, id});
    return acc;
  }, {});
  const spacing = longest + 2;
  console.log(Array(spacing + 5).join("-"));
  console.log("Profile Dimensions");
  Object.keys(pairs).forEach(pid => {
    console.log(Array(spacing + 5).join("-"));
    pairs[pid].forEach(d => {
      const spaces = spacing - d.slug.length;
      console.log(d.slug, Array(spaces).join(" "), d.id);
    });
  });
  process.exit(0);
}

const options = getopts(process.argv.slice(2), {
  alias: {
    dimension: "d",
    slugs: "s",
    all: "a"
  }
});

const action = options._[0] || "help";

switch (action) {
  case "list":
    doList();
    break;
  case "run":
    if (!options.dimension) {
      console.log("Missing profile parameter! (try canon-cms-ingest help)");
      process.exit(0);
    }
    doIngest(options);
    break;
  default:  // includes "help"
    console.log(helpText);
    process.exit(0);
}
