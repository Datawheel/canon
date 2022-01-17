#! /usr/bin/env node

/* Imports */
const axios = require("axios");
const getopts = require("getopts");
const loadModels = require("./loadModels");
const Sequelize = require("sequelize");
const {translateProfile} = require("../../src/utils/translation/translationUtils");

/* DB */
const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
const db = new Sequelize(name, user, pw, {host, dialect: "postgres", operatorsAliases: false, define: {timestamps: true}, logging: () => {}});

const helpText = `Canon CMS / Translation Script
Usage: npx canon-cms-translate <command> [args]

For language codes, see https://cloud.google.com/translate/docs/languages

*** Remember, the CMS server must be running! ***

Commands:
    help    Shows this information.
    run     Runs a translation operation
            - Required: target, profile
            - Optional: source, member

    If command is not set, "run" will be executed.

Arguments:
    -b, --base      The root url on which to run translations
    -h, --help      Shows this information.
    -m, --member    The slug of the sample member to use during translation (optional, ignored when profile=all)
    -p, --profile   The integer id for the the profile to translate
                    Use "all" to translate entire cms (be careful, this can be $ expensive)
    -s, --source    The source language to use for translation (optional, defaults to CANON_LANGUAGE_DEFAULT)
    -t, --target    The target language for translation. 
`;

/** */
async function doTranslate(options) {
  const {
    base,
    member,
    profile,
    source,
    target
  } = options;
  if (target === process.env.CANON_LANGUAGE_DEFAULT) {
    console.log("You have set your target language to your language default. This is almost definitely incorrect. Exiting...");
    process.exit(0);
  }
  console.log("Initializing Models...");
  await loadModels(db, "../../src/db").catch(e => {
    console.log("Failed to load models, exiting...");
    console.log(e);
    process.exit(0);
  });
  console.log("Models loaded.");
  // Fetch Relevant Profile
  console.log(`Fetching Profile ${profile}...`);
  const profiles = await db.profile.findAll({where: profile === "all" ? {} : {id: profile}, include: [{association: "meta"}]}).catch(() => {});
  if (profiles.length === 0) {
    console.error("No matching profiles found.");
    process.exit(0);
  }
  for (const [index, thisProfile] of profiles.entries()) {
    console.log(`Processing profile ${thisProfile.id}... (${index + 1}/${profiles.length})`);
    if (member && profile !== "all") {
      console.log(`Fetching member ${member}...`);
    }
    else {
      // Find Top Member by zvalue
      console.log(`Fetching sample member from profile ${thisProfile.id}...`); 
    }
    const {dimension, cubeName, slug} = thisProfile.meta[0];
    const members = await db.search.findAll({
      order: [["zvalue", "DESC NULLS LAST"]], limit: 1, include: [{association: "content"}],
      where: member ? {dimension, cubeName, slug: member} : {dimension, cubeName}
    });
    if (members.length === 0) {
      console.error(`No matching members found, skipping profile ${thisProfile.id}...`);
      continue;
    }
    const topid = members[0].id;
    console.log(`Found member: ${topid} (${members[0].slug}).`);
    // Fetch variables for varSwap
    const baseapi = base.substr(-1) === "/" ? base.substr(0, base.length - 1) : base;
    const profileURL = `${baseapi}/api/profile?slug1=${slug}&id1=${topid}&locale=${source}`;
    console.log(`Fetching variables for ${topid}...`);
    const fullProfile = await axios.get(profileURL).then(d => d.data).catch(e => {
      console.log(`Could not retrieve variables, are you sure the server is running? Skipping profile ${thisProfile.id}...`);
      console.log(`Error: ${e}`);
      return false;
    });
    if (!fullProfile) continue;
    console.log("Variables retrieved.");
    const {variables} = fullProfile;  
    const pid = thisProfile.id;
    const config = {variables, source, target};
    const response = await translateProfile(db, pid, config).catch(e => {
      console.log(`Translation Failed: ${e}`);
      return false;
    });
    if (response) {
      console.log(`Translation of profile ${thisProfile.id} from ${source} to ${target} complete.`);
    }
  }
  console.log(`Translated ${profiles.length} profile(s).`);
  process.exit(0);
}

const options = getopts(process.argv.slice(2), {
  alias: {
    base: "b",
    help: "h",
    member: "m",
    profile: "p",
    source: "s",
    target: "t"
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
    doTranslate(options);
  }
}
