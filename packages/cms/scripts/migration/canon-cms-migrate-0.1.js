#! /usr/bin/env node
 
const utils = require("./migrationUtils.js");
const {catcher, resetSequence, fetchOldModel, fetchNewModel} = utils;
const shell = require("shelljs");
const oldDBName = process.env.CANON_CMS_MIGRATION_OLD_DB_NAME || process.env.CANON_CONST_MIGRATION_OLD_DB_NAME;
const newDBName = process.env.CANON_CMS_MIGRATION_NEW_DB_NAME || process.env.CANON_CONST_MIGRATION_NEW_DB_NAME;

const migrate = async() => {

  const dbold = await fetchOldModel("/db_0.1", false);
  const dbnew = await fetchNewModel("/db_0.6", true);

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
    footnotes: "story_footnote"
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
  await resetSequence(dbnew, "images", "id");

  // Copy the Formatters
  let formatters = await dbold.formatter.findAll();
  formatters = formatters.map(row => row.toJSON());
  await dbnew.formatter.bulkCreate(formatters);
  await resetSequence(dbnew, "formatter", "id");

  // Copy each profile
  let profiles = await dbold.profile.findAll({include: [
    {association: "generators", separate: true},
    {association: "materializers", separate: true},
    {association: "stats", separate: true},
    {association: "footnotes", separate: true},
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
    await dbnew.profile_meta.create({profile_id: newprofile.id, slug, dimension, levels, ordering: 0});
    // create its associated english language content
    const {title, subtitle, label} = oldprofile;
    await dbnew.profile_content.create({id: newprofile.id, lang: "en", title, subtitle, label}).catch(catcher);

    // transfer generators
    for (const generator of oldprofile.generators) {
      const {name, api, description, logic} = generator; 
      const simple = generator.simple || false;
      const logic_simple = generator.logic_simple || null; // eslint-disable-line camelcase
      await dbnew.generator.create({profile_id: newprofile.id, name, api, description, logic, simple, logic_simple}).catch(catcher);
    }

    // transfer materializers
    for (const materializer of oldprofile.materializers) {
      const {name, description, logic, ordering} = materializer;
      await dbnew.materializer.create({profile_id: newprofile.id, name, description, logic, ordering}).catch(catcher);
    }

    // make a topic to replace the profile about/stats/viz
    let profiletopic = await dbnew.topic.create({ordering: nextTopicLoc, profile_id: newprofile.id, type: "Hero", slug: "hero"}).catch(catcher);
    profiletopic = profiletopic.toJSON();
    // increment the topic head
    nextTopicLoc++;
    // create its associated english language content
    await dbnew.topic_content.create({title: "Hero", lang: "en", id: profiletopic.id}).catch(catcher);
    for (const list of ["stats"]) {
      for (const entity of oldprofile[list]) {
        // migrate the array of profile entities to the new "profiletopic"
        const {ordering, allowed} = entity;
        let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: profiletopic.id, ordering, allowed}).catch(catcher);
        newTopicEntity = newTopicEntity.toJSON();
        // create associated english content
        const {description, title, subtitle, value, tooltip} = entity;
        await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, title, subtitle, value, tooltip}).catch(catcher);
      }
    }
    oldprofile.sections.sort((a, b) => a.ordering - b.ordering);
    for (const oldsection of oldprofile.sections) {
      // make this section into a new topic, with an ordering of the current "ordering head"
      const {slug, allowed} = oldsection;
      let sectiontopic = await dbnew.topic.create({ordering: nextTopicLoc, profile_id: newprofile.id, type: "Grouping", slug, allowed}).catch(catcher);
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
            const logic_simple = entity.logic_simple  || null; // eslint-disable-line camelcase
            let newTopicEntity = await dbnew[tableLookup[list]].create({topic_id: newtopic.id, ordering, allowed, logic, options, name, type, title: entity.title, default: entity.default, simple, logic_simple}).catch(catcher);
            newTopicEntity = newTopicEntity.toJSON();     
            // create associated english content
            const {description, title, subtitle, value, tooltip} = entity;
            if (list !== "visualizations" && list !== "selectors") await dbnew[`${tableLookup[list]}_content`].create({id: newTopicEntity.id, lang: "en", description, title, subtitle, value, tooltip}).catch(catcher);
          }
        }
      }
    }
    if (oldprofile.footnotes.length > 0) {
      oldprofile.footnotes.sort((a, b) => a.ordering - b.ordering);
      for (const oldfootnote of oldprofile.footnotes) {
        const slug = `footnote-${oldfootnote.ordering + 1}`;
        let newtopic = await dbnew.topic.create({profile_id: newprofile.id, ordering: nextTopicLoc, type: "Footnote", slug, allowed: "always"}).catch(catcher);
        newtopic = newtopic.toJSON();
        nextTopicLoc++;
        const {description, title} = oldfootnote;
        await dbnew.topic_content.create({title, lang: "en", id: newtopic.id}).catch(catcher);
        let newDescription = await dbnew.topic_description.create({topic_id: newtopic.id, allowed: "always", ordering: 0}).catch(catcher);
        newDescription = newDescription.toJSON();
        await dbnew.topic_description_content.create({description, lang: "en", id: newDescription.id}).catch(catcher);
      }
    }
  }

  // Copy each story
  let stories = await dbold.story.findAll({include: [
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
    const {title, subtitle, image} = oldstory;
    await dbnew.story_content.create({id: newstory.id, lang: "en", title, subtitle, image}).catch(catcher);
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
  console.log(`Successfully migrated from CMS version 0.1 on ${oldDBName} to CMS version 0.6 on ${newDBName}`);
  shell.exit(0);
};

migrate();

return;



