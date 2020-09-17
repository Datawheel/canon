#! /usr/bin/env node

/* Imports */
const axios = require("axios");
const FUNC = require("../../src/utils/FUNC");
const getopts = require("getopts");
const loadModels = require("./loadModels");
const Sequelize = require("sequelize");
const {Translate} = require("@google-cloud/translate").v2;
const varSwap = require("../../src/utils/varSwap");

/* DB */
const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
const db = new Sequelize(name, user, pw, {host, dialect: "postgres", operatorsAliases: false, define: {timestamps: true}, logging: () => {}});

const translate = new Translate();

const helpText = `Canon CMS / Translation Script
Usage: npx canon-cms-translate <command> [args]

For language codes, see https://cloud.google.com/translate/docs/languages

Commands:
    help    Shows this information.
    run     Runs a translation operation
            - Required: target, profile
            - Optional: source, member

    If command is not set, "run" will be executed.

Arguments:
    -h, --help      Shows this information.
    -m, --member    The slug of the sample member to use during translation (optional)
    -p, --profile   The integer id for the the profile to translate
                    Use "all" to translate entire cms (be careful, this can be $ expensive)
    -s, --source    The source language to use for translation (optional, defaults to CANON_LANGUAGE_DEFAULT)
    -t, --target    The target language for translation. 
`;

const source = "en";
const target = "es";
const pid = 1;

const faketranslate = s => s.length ? `hola, ${s}` : s;

const spanify = (s, vsConfig) => {
  if (!s.length) return s;
  const {variables, formatterFunctions} = vsConfig;
  const vs = d => varSwap(d, formatterFunctions, variables);
  const template = (match, g1) => `<canonspan id="${g1}" class="variable">${vs(g1)}</canonspan>`;
  return s.replace(/([A-z0-9]*\{\{[^\}]+\}\})/g, template);
};

const varify = s => {
  if (!s.length) return s;
  return s.replace(/\<canonspan id=\"([A-z0-9]*\{\{[^\}]+\}\})\" class\=\"variable\"\>.*?\<\/canonspan\>/g, "$1");
};

const catcher = e => console.log("error: ", e);

const formatters4eval = async(db, locale) => {
  const formatters = await db.formatter.findAll().catch(catcher);
  return formatters.reduce((acc, f) => {
    const name = f.name === f.name.toUpperCase()
      ? f.name.toLowerCase()
      : f.name.replace(/^\w/g, chr => chr.toLowerCase());
    // Formatters may be malformed. Wrap in a try/catch to avoid js crashes.
    try {
      acc[name] = FUNC.parse({logic: f.logic, vars: ["n"]}, acc, locale);
    }
    catch (e) {
      console.error(`Server-side Malformed Formatter encountered: ${name}`);
      console.error(`Error message: ${e.message}`);
      acc[name] = FUNC.parse({logic: "return \"N/A\";", vars: ["n"]}, acc, locale);
    }
    return acc;
  }, {});
};

/** */
async function translateRow(row, vsConfig) {
  const {id, locale, ...rest} = row; //eslint-disable-line
  const newContent = {id, locale: "es"};
  const keys = Object.keys(rest);
  for (const key of keys) {
    if (rest[key]) {
      const text = spanify(rest[key], vsConfig);
      const resp = await translate.translate(text, target);
      if (resp && resp[0]) {
        newContent[key] = varify(resp[0]);
      }
      else newContent[key] = rest[key];
    }
    else {
      newContent[key] = rest[key];
    }
  }
  return newContent;
}

/** */
async function translateText(options) {
  const {
    member,
    profile,
    source,
    target
  } = options;
  console.log("Initializing Models...");
  await loadModels(db, "../../src/db").catch(e => console.log(e));
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
    if (member) {
      console.log(`Fetching member ${member}...`);
    }
    else {
      // Find Top Member by zvalue
      console.log(`Fetching sample member from profile ${thisProfile.id}...`); 
    }
    const {dimension, cubeName, slug} = thisProfile.meta[0];
    const members = await db.search.findAll({
      order: [["zvalue", "DESC NULLS LAST"]], limit: 2, include: [{association: "content"}],
      where: member ? {dimension, cubeName, slug: member} : {dimension, cubeName}
    });
    if (members.length === 0) {
      console.error("No matching members found.");
      process.exit(0);
    }
    const topid = members[1].id;
    console.log(`Found member: ${topid} (${members[1].slug}).`);
  }
  return;
  
  // Fetch variables for varSwap
  const url = `http://localhost:3300/api/profile?slug1=${slug}&id1=${topid}&locale=${source}`;
  console.log(`Fetching variables for ${topid}...`);
  const fullProfile = await axios.get(url).then(d => d.data).catch(e => console.log(e));
  console.log("Variables retrieved.");
  const vsConfig = {
    variables: fullProfile.variables,
    formatterFunctions: await formatters4eval(db, source)
  };

  const sections = await db.section.findAll({where: {profile_id: pid}}).catch(() => []);
  
  const sids = sections.map(d => d.id);
  const content = await db.section_content.findAll({where: {id: sids, locale: source}}).catch(() => []);
  for (const [index, row] of content.entries()) {
    const newContent = await translateRow(row.toJSON(), vsConfig);
    console.log(`${index + 1}/${sids.length}`);
    await db.section_content.upsert(newContent).catch(catcher);
  }
  for (const table of ["section_description", "section_stat", "section_subtitle"]) {
    const entities = await db[table].findAll({where: {section_id: sids}}).catch(() => []);
    const cids = entities.map(d => d.id);
    const content = await db[`${table}_content`].findAll({where: {id: cids, locale: source}}).catch(() => []);
    for (const [index, row] of content.entries()) {
      const newContent = await translateRow(row.toJSON(), vsConfig);
      console.log(`${index + 1}/${cids.length}`);
      await db[`${table}_content`].upsert(newContent).catch(catcher);  
    }
  }
  console.log("done");
  process.exit(0);
}

const options = getopts(process.argv.slice(2), {
  alias: {
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
  if (!options.target || !options.profile) {
    console.log("Please specify a target language and profile");
  }
  else {
    translateText(options);
  }
}



