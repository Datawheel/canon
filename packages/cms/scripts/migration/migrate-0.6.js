#! /usr/bin/env node
 
const Sequelize = require("sequelize");
const utils = require("./migrationUtils.js");
const {catcher, loadModels, resetSequence} = utils;

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

const migrate = async() => {

  await loadModels(dbold, "/db_0.6", false);
  await loadModels(dbnew, "/db_0.7", true);

  // The order of this migration matters - Many tables have FK dependencies, so the tables must be created in order.
  const migrationMap = [
    // These ones have no dependencies and can be copied wholesale
    {old: "formatter", new: "formatter"},
    {old: "search", new: "search"},
    {old: "images", new: "images"},
    // Profile 
    {old: "profile", new: "profile"},
    {old: "profile_content", new: "profile_content"},
    {old: "profile_meta", new: "profile_meta"},
    {old: "generator", new: "generator"},
    {old: "materializer", new: "materializer"},
    // Topic -> Section
    {old: "topic", new: "section"},
    {old: "topic_content", new: "section_content"},
    {old: "topic_description", new: "section_description"},
    {old: "topic_description_content", new: "section_description_content"},
    {old: "topic_stat", new: "section_stat"},
    {old: "topic_stat_content", new: "section_stat_content"},
    {old: "topic_subtitle", new: "section_subtitle"},
    {old: "topic_subtitle_content", new: "section_subtitle_content"},
    {old: "topic_visualization", new: "section_visualization"},
    // Story
    {old: "story", new: "story"},
    {old: "story_content", new: "story_content"},
    {old: "story_description", new: "story_description"},
    {old: "story_description_content", new: "story_description_content"},
    {old: "story_footnote", new: "story_footnote"},
    {old: "story_footnote_content", new: "story_footnote_content"},
    // Storytopic -> Storysection
    {old: "storytopic", new: "storysection"},
    {old: "storytopic_content", new: "storysection_content"},
    {old: "storytopic_description", new: "storysection_description"},
    {old: "storytopic_description_content", new: "storysection_description_content"},
    {old: "storytopic_stat", new: "storysection_stat"},
    {old: "storytopic_stat_content", new: "storysection_stat_content"},
    {old: "storytopic_subtitle", new: "storysection_subtitle"},
    {old: "storytopic_subtitle_content", new: "storysection_subtitle_content"},
    {old: "storytopic_visualization", new: "storysection_visualization"}
  ];

  for (const tableObj of migrationMap) {
    let rows = await dbold[tableObj.old].findAll();
    rows = rows.map(row => {
      row = row.toJSON();
      Object.keys(row).forEach(key => {
        if (key.includes("topic")) {
          row[key.replace("topic", "section")] = row[key];
          delete row[key];
        }
      });
      return row;
    });
    await dbnew[tableObj.new].bulkCreate(rows).catch(catcher);
    await resetSequence(dbnew, tableObj.new, "id");
  }

  // Selectors need a special migration
  let selectors = await dbold.selector.findAll();
  selectors = selectors.map(row => row.toJSON());
  for (const oldselector of selectors) {
    let oldtopic = await dbold.topic.findOne({where: {id: oldselector.topic_id}});
    oldtopic = oldtopic.toJSON();
    oldselector.profile_id = oldtopic.profile_id;
    delete oldselector.topic_id;
    let newselector = await dbnew.selector.create(oldselector).catch(catcher);
    newselector = newselector.toJSON();
    await dbnew.section_selector.create({
      section_id: oldtopic.id,
      selector_id: newselector.id,
      ordering: oldselector.ordering
    }).catch(catcher);
  }

  console.log("Done.");
};

migrate();

return;



