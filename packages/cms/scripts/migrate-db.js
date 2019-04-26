#! /usr/bin/env node

const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const oldDBName = process.env.CANON_CONST_MIGRATION_OLD_DB_NAME;
const oldDBUser = process.env.CANON_CONST_MIGRATION_OLD_DB_USER;
const oldDBPW = process.env.CANON_CONST_MIGRATION_OLD_DB_PW || null;
const oldDBHost = process.env.CANON_CONST_MIGRATION_OLD_DB_HOST;

const newDBName = process.env.CANON_CONST_MIGRATION_NEW_DB_NAME;
const newDBUser = process.env.CANON_CONST_MIGRATION_NEW_DB_USER;
const newDBPW = process.env.CANON_CONST_MIGRATION_NEW_DB_PW || null;
const newDBHost = process.env.CANON_CONST_MIGRATION_NEW_DB_HOST;

const dbold = new Sequelize(oldDBName, oldDBUser, oldDBPW, {host: oldDBHost, dialect: "postgres", define: {timestamps: true}, logging: () => {}});
const dbnew = new Sequelize(newDBName, newDBUser, newDBPW, {host: newDBHost, dialect: "postgres", define: {timestamps: true}, logging: () => {}});

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

const migrate = async() => {

  await loadModels(dbold, "/db_legacy", false);
  await loadModels(dbnew, "../db", true);

  const tableLookup = {
    descriptions: "topic_description",
    subtitles: "topic_description",
    visualizations: "topic_description",
    stats: "topic_stats"
  };
  
  // Copy the non-cms tables wholesale
  ["images", "search"].forEach(async table => {
    let rows = await dbold[table].findAll();
    rows = rows.map(row => row.toJSON());
    await dbnew[table].bulkCreate(rows);
  });

  // Copy each profile
  let profiles = await dbold.profiles.findAll({include: [
    {association: "generators"},
    {association: "materializers"},
    {association: "sections", include: [{association: "topics"}]}
  ]});
  profiles = profiles.map(profile => profile.toJSON());
  profiles.forEach(async oldprofile => {
    // initiate the topic ordering head counter
    let nextTopicLoc = 0;
    // make the top-level profile itself
    const {slug, ordering, dimension} = oldprofile;
    let newprofile = await dbnew.profile.create({slug, ordering, dimension}).catch(catcher);
    newprofile = newprofile.toJSON();
    // create its associated english language content
    const {title, subtitle, label} = oldprofile;
    await dbnew.profile_content.create({id: newprofile.id, lang: "en", title, subtitle, label}).catch(catcher);

    // transfer generators
    oldprofile.generators.forEach(async generator => {
      const {name, api, description, logic} = generator;
      await dbnew.generator.create({profile_id: newprofile.id, name, api, description, logic, simple: false}).catch(catcher);
    });

    // transfer materializers
    oldprofile.materializers.forEach(async materializer => {
      const {name, description, logic, ordering} = materializer;
      await dbnew.materializer.create({profile_id: newprofile.id, name, description, logic, ordering}).catch(catcher);
    });

  });
};

migrate();



