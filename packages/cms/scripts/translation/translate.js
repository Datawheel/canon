#! /usr/bin/env node

const Sequelize = require("sequelize");
const loadModels = require("./loadModels");

const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
 
const {Translate} = require("@google-cloud/translate").v2;

const db = new Sequelize(name, user, pw, {host, dialect: "postgres", define: {timestamps: true}, logging: () => {}});

const translate = new Translate();

const source = "en";
const target = "es";

const faketranslate = s => s.length ? `hola, ${s}` : s;
const spanify = s => s.length ? s.replace(/\{\{/g, "<span class=\"notranslate\">").replace(/\}\}/g, "</span>") : s;
const varify = s => s.length ? s.replace(/\<span class\=\"notranslate\"\>([^\<]+)\<\/span\>/g, "{{$1}}") : s;

const catcher = e => console.log("error: ", e);

/** */
async function translateRow(row) {
  const {id, locale, ...rest} = row; //eslint-disable-line
  const newContent = {id, locale: "gt"};
  const keys = Object.keys(rest);
  for (const key of keys) {
    if (rest[key]) {
      const text = spanify(rest[key]);
      //let resp;
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
  await loadModels(db, "../../src/db");
  const sections = await db.section.findAll({where: {profile_id: 1}}).catch(() => []);
  const sids = sections.map(d => d.id);
  const content = await db.section_content.findAll({where: {id: sids, locale: source}}).catch(() => []);
  for (const row of content) {
    const newContent = await translateRow(row.toJSON());
    await db.section_content.upsert(newContent).catch(catcher);
  }
  for (const table of ["section_description", "section_stat", "section_subtitle"]) {
    const entities = await db[table].findAll({where: {section_id: sids}}).catch(() => []);
    const cids = entities.map(d => d.id);
    const content = await db[`${table}_content`].findAll({where: {id: cids, locale: source}}).catch(() => []);
    for (const row of content) {
      const newContent = await translateRow(row.toJSON());
      await db[`${table}_content`].upsert(newContent).catch(catcher);  
    }
  }
  console.log("done");
}

translateText();

return;



