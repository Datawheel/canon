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

  await loadModels(dbold, "/db_0.1", false);
  await loadModels(dbnew, "/db_0.6", true);

  const tableLookup = {
    descriptions: "topic_description",
    subtitles: "topic_subtitle",
    visualizations: "topic_visualization",
    stats: "topic_stat",
    selectors: "selector"
  };

  const storyLookup = {
    authors: "author", 
    descriptions: "story_description",
    footnotes: "story_footnte"
  };

  const storytopicLookup = {
    descriptions: "storytopic_description",
    subtitles: "storytopic_subtitle",
    visualizations: "storytopic_visualization",
    stats: "storytopic_stat"
  };
  
  // Copy the non-cms tables wholesale
  for (const table of ["images", "search"]) {
    let rows = await dbold[table].findAll();
    rows = rows.map(row => row.toJSON());
    await dbnew[table].bulkCreate(rows);
  }

  // Copy the Formatters
  let formatters = await dbold.formatters.findAll();
  formatters = formatters.map(row => row.toJSON());
  await dbnew.formatter.bulkCreate(formatters);

  // Copy each profile
  let profiles = await dbold.profiles.findAll({include: [
    {association: "generators", separate: true},
    {association: "materializers", separate: true},
    {association: "descriptions", separate: true},
    {association: "stats", separate: true},
    {association: "visualizations", separate: true},
    {association: "sections", separate: true, include: [
      {association: "descriptions", separate: true},
      {association: "subtitles", separate: true},
      {association: "topics", separate: true, include: [
        {association: "selectors", separate: true},
        {association: "descriptions", separate: true},
        {association: "subtitles", separate: true},
        {association: "stats", separate: true},
        {association: "visualizations", separate: true}
      ]}
    ]}
  ]});
  profiles = profiles.map(profile => profile.toJSON());
  profiles.sort((a, b) => a.ordering - b.ordering);
  for (const oldprofile of profiles) { 
    // initiate the topic ordering head counter
    let nextTopicLoc = 0;
    // make the top-level profile itself
    // slug, dimension
    const {dimension, ordering, slug} = oldprofile;
    const levels = [];
    let newprofile = await dbnew.profile.create({ordering}).catch(catcher);
    newprofile = newprofile.toJSON();
    // create its associated meta content
    await dbnew.profile_meta.create({profile_id: newprofile.id, slug, dimension, levels});
    // create its associated english language content
    const {title, subtitle, label} = oldprofile;
    await dbnew.profile_content.create({id: newprofile.id, lang: "en", title, subtitle, label}).catch(catcher);

    // transfer generators
    for (const generator of oldprofile.generators) {
      const {name, api, description, logic} = generator;
      await dbnew.generator.create({profile_id: newprofile.id, name, api, description, logic, simple: false}).catch(catcher);
    }

    // transfer materializers
    for (const materializer of oldprofile.materializers) {
      const {name, description, logic, ordering} = materializer;
      await dbnew.materializer.create({profile_id: newprofile.id, name, description, logic, ordering}).catch(catcher);
    }

    // make a topic to replace the profile about/stats/viz
    let profiletopic = await dbnew.topic.create({ordering: nextTopicLoc, profile_id: newprofile.id, type: "About", slug: "about"}).catch(catcher);
    profiletopic = profiletopic.toJSON();
    // increment the topic head
    nextTopicLoc++;
    // create its associated english language content
    await dbnew.topic_content.create({title: "About", lang: "en", id: profiletopic.id}).catch(catcher);
    for (const list of ["descriptions", "stats", "visualizations"]) {
      for (const entity of oldprofile[list]) {
        // migrate the array of profile entities to the new "profiletopic"
        const {ordering, allowed, logic} = entity;
        const simple = entity.simple || false;
        let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: profiletopic.id, ordering, allowed, logic, simple}).catch(catcher);
        newTopicEntity = newTopicEntity.toJSON();
        // create associated english content
        const {description, title, subtitle, value, tooltip} = entity;
        if (list !== "visualizations") await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, title, subtitle, value, tooltip}).catch(catcher);
      }
    }
    oldprofile.sections.sort((a, b) => a.ordering - b.ordering);
    for (const oldsection of oldprofile.sections) {
      // make this section into a new topic, with an ordering of the current "ordering head"
      const {slug, allowed} = oldsection;
      let sectiontopic = await dbnew.topic.create({ordering: nextTopicLoc, profile_id: newprofile.id, type: "Section", slug, allowed}).catch(catcher);
      sectiontopic = sectiontopic.toJSON();
      // increment the topic head
      nextTopicLoc++;
      // create its associated english language content
      const {title} = oldsection;
      await dbnew.topic_content.create({title, lang: "en", id: sectiontopic.id}).catch(catcher);
      for (const list of ["descriptions", "subtitles"]) {
        for (const entity of oldsection[list]) {
          // migrate the array of section entities to the new "sectiontopic"
          const {ordering, allowed} = entity;
          let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: sectiontopic.id, ordering, allowed}).catch(catcher);
          newTopicEntity = newTopicEntity.toJSON();
          // create associated english content
          const {description, subtitle} = entity;
          await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, subtitle}).catch(catcher);
        }
      }
      // For every OLD topic that belonged to the section
      oldsection.topics.sort((a, b) => a.ordering - b.ordering);
      for (const oldtopic of oldsection.topics) {
        // create a topic that's a child of the new profile
        const {type, slug, allowed} = oldtopic;
        let newtopic = await dbnew.topic.create({profile_id: newprofile.id, ordering: nextTopicLoc, type, slug, allowed}).catch(catcher);
        newtopic = newtopic.toJSON();
        // increment the topic head
        nextTopicLoc++;
        // create its associated english language content
        const {title} = oldtopic;
        await dbnew.topic_content.create({title, lang: "en", id: newtopic.id}).catch(catcher);
        for (const list of ["descriptions", "stats", "subtitles", "visualizations", "selectors"]) {
          for (const entity of oldtopic[list]) {
            const {ordering, allowed, logic, options, name, type} = entity;
            const simple = entity.simple || false;
            let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: newtopic.id, ordering, allowed, logic, options, name, type, default: entity.default, simple}).catch(catcher);
            newTopicEntity = newTopicEntity.toJSON();     
            // create associated english content
            const {description, title, subtitle, value, tooltip} = entity;
            if (list !== "visualizations" && list !== "selectors") await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, title, subtitle, value, tooltip}).catch(catcher);
          }
        }
      }
    }
  }

  // Copy each story
  let stories = await dbold.stories.findAll({include: [
    {association: "authors", separate: true},
    {association: "descriptions", separate: true},
    {association: "footnotes", separate: true},
    {association: "storytopics", separate: true, include: [
      {association: "descriptions", separate: true},
      {association: "stats", separate: true},
      {association: "subtitles", separate: true},
      {association: "visualizations", separate: true}
    ]}
  ]});
  stories = stories.map(story => story.toJSON());
  stories.sort((a, b) => a.ordering - b.ordering);
  for (const oldstory of stories) { 
    // make the top-level story itself
    const {slug, ordering} = oldstory;
    let newstory = await dbnew.story.create({slug, ordering}).catch(catcher);
    newstory = newstory.toJSON();
    // create its associated english language content
    const {title, image} = oldstory;
    await dbnew.story_content.create({id: newstory.id, lang: "en", title, image}).catch(catcher);
    // move the story entities
    for (const list of ["authors", "descriptions", "footnotes"]) {
      for (const entity of oldstory[list]) {
        const {ordering} = entity;
        let newStoryEntity = await dbnew[storyLookup[list]].create({story_id: newstory.id, ordering});
        newStoryEntity = newStoryEntity.toJSON();
        // create associated english content
        const {description, name, title, image, twitter, bio} = entity;
        await dbnew[`${storyLookup[list]}_content`].create({id: newStoryEntity.id, lang: "en", description, name, title, image, twitter, bio});
      }
    }
    // move the storytopics
    oldstory.storytopics.sort((a, b) => a.ordering - b.ordering);
    for (const oldstorytopic of oldstory.storytopics) {
      // take the toplevel storytopic stuff
      const {type, slug, ordering} = oldstorytopic;
      let newstorytopic = await dbnew.storytopic.create({story_id: newstory.id, ordering, type, slug});
      newstorytopic = newstorytopic.toJSON();
      // create its associated english language content
      const {title} = oldstorytopic;
      await dbnew.storytopic_content.create({title, lang: "en", id: newstorytopic.id});
      for (const list of ["descriptions", "stats", "subtitles", "visualizations"]) {
        for (const entity of oldstorytopic[list]) {
          const {ordering, logic} = entity;
          let newStoryTopicEntity = await dbnew[storytopicLookup[list]].create({storytopic_id: newstorytopic.id, ordering, logic});
          newStoryTopicEntity = newStoryTopicEntity.toJSON();     
          // create associated english content
          const {description, title, subtitle, value, tooltip} = entity;
          if (list !== "visualizations") await dbnew[`${storytopicLookup[list]}_content`].create({id: newStoryTopicEntity.id, lang: "en", description, title, subtitle, value, tooltip});
        }
      }
    }
  }
  console.log("Done.");
};

migrate();

return;



