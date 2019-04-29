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
    subtitles: "topic_subtitle",
    visualizations: "topic_visualization",
    stats: "topic_stat"
  };
  
  // Copy the non-cms tables wholesale
  ["images", "search"].forEach(async table => {
    let rows = await dbold[table].findAll();
    rows = rows.map(row => row.toJSON());
    await dbnew[table].bulkCreate(rows);
  });

  // Copy each profile
  let profiles = await dbold.profiles.findAll({include: [
    {association: "generators", separate: true},
    {association: "materializers", separate: true},
    {association: "descriptions", separate: true},
    {association: "stats", separate: true},
    {association: "visualizations", separate: true},
    {association: "sections", separate: true, include: [{association: "topics", separate: true}]}
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

    // make a topic to replace the profile about/stats/viz
    let profiletopic = await dbnew.topic.create({ordering: nextTopicLoc, profile_id: newprofile.id, type: "About", slug: "about"}).catch(catcher);
    profiletopic = profiletopic.toJSON();
    // increment the topic head
    nextTopicLoc++;
    // create its associated english language content
    await dbnew.topic_content.create({title: "About", lang: "en", id: profiletopic.id});
    ["descriptions", "stats", "visualizations"].forEach(list => {
      oldprofile[list].forEach(async entity => {
        // migrate the array of profile entities to the new "profiletopic"
        const {ordering, allowed} = entity;
        let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: profiletopic.id, ordering, allowed});
        newTopicEntity = newTopicEntity.toJSON();
        // create associated english content
        const {description, title, subtitle, value, tooltip} = entity;
        if (list !== "visualizations") await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, title, subtitle, value, tooltip});
      });
    });
    oldprofile.sections.forEach(async oldsection => {
      // make this section into a new topic, with an ordering of the current "ordering head"
      const {slug, allowed} = oldsection;
      let sectiontopic = await dbnew.topic.create({ordering: nextTopicLoc, profile_id: newprofile.id, type: "Section", slug, allowed});
      sectiontopic = sectiontopic.toJSON();
      // increment the topic head
      nextTopicLoc++;
      // create its associated english language content
      const {title} = sectiontopic;
      await dbnew.topic_content.create({title, lang: "en", id: sectiontopic.id});
      ["descriptions", "subtitles"].forEach(list => {
        oldsection[list].forEach(async entity => {
          // migrate the array of section entities to the new "sectiontopic"
          const {ordering, allowed} = entity;
          let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: sectiontopic.id, ordering, allowed});
          newTopicEntity = newTopicEntity.toJSON();
          // create associated english content
          const {description, subtitle} = entity;
          await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, subtitle});
        });
      });
      // For every OLD topic that belonged to the section
    });
  });
};

migrate();



