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
async function translateText() {
  await loadModels(db, "../../src/db");
  const sections = await db.section.findAll({where: {profile_id: 1}}).catch(() => []);
  const sids = sections.map(d => d.id);
  const descriptions = await db.section_description.findAll({where: {section_id: sids}}).catch(() => []);
  const cids = descriptions.map(d => d.id);
  let dcontent = await db.section_description_content.findAll({where: {id: 608, locale: source}}).catch(() => []);
  dcontent = dcontent.map(d => d.toJSON()).slice(0, 1);
  for (const row of dcontent) {
    const {id, locale, ...rest} = row; //eslint-disable-line
    const newContent = {id, locale: "gt"};
    const keys = Object.keys(rest);
    for (const key of keys) {
      if (rest[key]) {
        const text = spanify(rest[key]);
        console.log("before", text);
        let resp;
        //const resp = await translate.translate(text, target);
        if (resp && resp[0]) {
          console.log("mid", resp[0]);
          newContent[key] = varify(resp[0]);
          console.log("after", newContent[key]);
        }
        else newContent[key] = rest[key];
        console.log("after", varify(rest[key]));
      }
      else {
        newContent[key] = rest[key];
      }
    }
    // console.log("WOULD SEND", newContent);
    await db.section_description_content.upsert(newContent).catch(catcher);
  }
  console.log("done");
}

translateText();

return;



