#! /usr/bin/env node

const axios = require("axios");
const Sequelize = require("sequelize");
const loadModels = require("./loadModels");
const varSwap = require("../../src/utils/varSwap");
const FUNC = require("../../src/utils/FUNC");
const stripHTML = require("../../src/utils/formatters/stripHTML");

const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
 
const {Translate} = require("@google-cloud/translate").v2;

const db = new Sequelize(name, user, pw, {host, dialect: "postgres", define: {timestamps: true}, logging: () => {}});

const translate = new Translate();

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
async function translateText() {
  console.log("Initializing Models...");
  await loadModels(db, "../../src/db");    
  console.log("Models loaded.");
  // Fetch Relevant Profile
  const profile = await db.profile.findOne({where: {id: pid}, include: [{association: "meta"}]}).catch(() => {});
  // Find Top Member by zvalue
  console.log(`Finding sample member from profile ${profile.id}...`); 
  const {dimension, cubeName, slug} = profile.meta[0];
  const members = await db.search.findAll({
    order: [["zvalue", "DESC NULLS LAST"]], limit: 2, include: [{association: "content"}],
    where: {dimension, cubeName}
  });
  const topid = members[1].id;  
  console.log(`Found member: ${topid}.`); 
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
}

translateText();

return;



