#! /usr/bin/env node

const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const name = process.env.CANON_DB_NAME;
const user = process.env.CANON_DB_USER;
const pw = process.env.CANON_DB_PW;
const host = process.env.CANON_DB_HOST;
 
const {Translate} = require("@google-cloud/translate").v2;

const catcher = e => console.log("error: ", e);

const loadModels = (db, modelPath, clear) => {
  const folder = path.join(__dirname, modelPath);
  fs.readdirSync(folder)
    .filter(file => file && file.indexOf(".") !== 0)
    .forEach(file => {
      const fullPath = path.join(folder, file);
      const model = db.import(fullPath);
      db[model.name] = model;
    });
  Object.keys(db).forEach(modelName => {
    if ("associate" in db[modelName]) db[modelName].associate(db);
  });
  if (clear) {
    return db.sync({force: true}).catch(catcher);
  }
  else {
    return db.sync().catch(catcher);
  }
};

const db = new Sequelize(name, user, pw, {host, dialect: "postgres", define: {timestamps: true}, logging: () => {}});

const translate = new Translate();

const text = "Hello, world!";
const source = "en";
const target = "es";

const faketranslate = s => s.length ? `hola, ${s}` : s;

/** */
async function translateText() {
  await loadModels(db, "../../src/db");
  const where = {where: {locale: source}};
  let content = await db.profile_content.findAll(where).catch(() => []);
  content = content.map(d => d.toJSON());
  const newContent = content.map(d => {
    const {id, locale, ...rest} = d; //eslint-disable-line
    return Object.keys(rest).reduce((acc, key) => ({...acc, [key]: faketranslate(rest[key])}), {id, locale: target});
  });
  for (const c of newContent) {
    db.profile_content.upsert(c).catch(catcher);
  }
  console.log("done");
  /*
  const resp = await translate.translate(text, target);
  const translation = resp[0];
  console.log(`${text} => (${target}) ${translation}`);  
  */
}

translateText();

return;



