#! /usr/bin/env node
 
const utils = require("./migrationUtils.js");
const {catcher, resetSequence, fetchOldModel, fetchNewModel} = utils;
const shell = require("shelljs");
const oldDBName = process.env.CANON_CONST_MIGRATION_OLD_DB_NAME;
const newDBName = process.env.CANON_CONST_MIGRATION_NEW_DB_NAME;

const populateSearch = require("../../src/utils/populateSearch");

const migrate = async() => {

  const dbold = await fetchOldModel("/db_0.11", false);
  const dbnew = await fetchNewModel("/db_0.12", true);

  // The order of this migration matters - Many tables have FK dependencies, so the tables must be created in order.
  const migrationMap = [
    // These ones have no dependencies and can be copied wholesale
    {old: "formatter", new: "formatter"},
    {old: "image", new: "image"},
    {old: "image_content", new: "image_content"},
    {old: "search", new: "search"},
    // Skip search content for this upgrade! populateSearch will take care of it.
    // {old: "search_content", new: "search_content"},
    // Profile 
    {old: "profile", new: "profile"},
    {old: "profile_content", new: "profile_content"},
    {old: "profile_meta", new: "profile_meta"},
    {old: "generator", new: "generator"},
    {old: "materializer", new: "materializer"},
    // Section
    {old: "section", new: "section"},
    {old: "section_content", new: "section_content"},
    {old: "section_description", new: "section_description"},
    {old: "section_description_content", new: "section_description_content"},
    {old: "section_stat", new: "section_stat"},
    {old: "section_stat_content", new: "section_stat_content"},
    {old: "section_subtitle", new: "section_subtitle"},
    {old: "section_subtitle_content", new: "section_subtitle_content"},
    {old: "section_visualization", new: "section_visualization"},
    // Selectors
    {old: "selector", new: "selector"},
    {old: "section_selector", new: "section_selector"},
    // Story
    {old: "story", new: "story"},
    {old: "story_content", new: "story_content"},
    {old: "author", new: "author"},
    {old: "author_content", new: "author_content"},
    {old: "story_description", new: "story_description"},
    {old: "story_description_content", new: "story_description_content"},
    {old: "story_footnote", new: "story_footnote"},
    {old: "story_footnote_content", new: "story_footnote_content"},
    // Storysection -> Storysection
    {old: "storysection", new: "storysection"},
    {old: "storysection_content", new: "storysection_content"},
    {old: "storysection_description", new: "storysection_description"},
    {old: "storysection_description_content", new: "storysection_description_content"},
    {old: "storysection_stat", new: "storysection_stat"},
    {old: "storysection_stat_content", new: "storysection_stat_content"},
    {old: "storysection_subtitle", new: "storysection_subtitle"},
    {old: "storysection_subtitle_content", new: "storysection_subtitle_content"},
    {old: "storysection_visualization", new: "storysection_visualization"},
    // Users -> Users
    {old: "users", new: "users"}
  ];

  for (const tableObj of migrationMap) {
    // The search table needs to be deduplicated and routed to origin cubes
    if (tableObj.old === "search") {
      let oldmembers = await dbold.search.findAll({include: {association: "content"}});
      oldmembers = oldmembers.map(d => d.toJSON());
      // To regenerate search tables, find a list of all cubes in use by this installation
      let meta = await dbold.profile_meta.findAll().catch(catcher);
      meta = meta.map(row => row.toJSON());
      // We need to preserve images, keywords, and attr. Create a hashmap of old members, keyed by the id/dimension/hierarchy
      const metaLookup = oldmembers.reduce((obj, d) => {
        obj[`${d.id}-${d.dimension}-${d.hierarchy}`] = d;
        return obj;
      }, {});
      for (const m of meta) {
        await populateSearch(m, dbnew, metaLookup);
      }
    }
    else {
      let oldrows = await dbold[tableObj.old].findAll().catch(catcher);
      oldrows = oldrows.map(row => row.toJSON());
      await dbnew[tableObj.new].bulkCreate(oldrows).catch(catcher);
    }
    const idColumns = Object.keys(dbnew[tableObj.new].attributes).filter(d => d.toLowerCase().includes("id"));
    for (const column of idColumns) {
      await resetSequence(dbnew, tableObj.new, column);
    }
  }
  console.log(`Successfully migrated from CMS version 0.11 on ${oldDBName} to CMS version 0.12 on ${newDBName}`);
  shell.exit(0);
};

migrate();

return;
