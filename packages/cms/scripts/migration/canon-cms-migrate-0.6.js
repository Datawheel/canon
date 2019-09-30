#! /usr/bin/env node
 
const utils = require("./migrationUtils.js");
const {catcher, resetSequence, fetchOldModel, fetchNewModel} = utils;
const shell = require("shelljs");
const oldDBName = process.env.CANON_CONST_MIGRATION_OLD_DB_NAME;
const newDBName = process.env.CANON_CONST_MIGRATION_NEW_DB_NAME;

const sectionInclude = [
  {association: "descriptions", separate: true},
  {association: "subtitles", separate: true},
  {association: "stats", separate: true},
  {association: "visualizations", separate: true}
];

const updateSelector = (obj, oldname, newname) => {
  const re = new RegExp(oldname, "g");
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "string") obj[key] = obj[key].replace(re, newname);
  });
  return obj;
};

const migrate = async() => {

  const dbold = await fetchOldModel("/db_0.6", false);
  const dbnew = await fetchNewModel("/db_0.7", true);

  // The order of this migration matters - Many tables have FK dependencies, so the tables must be created in order.
  const migrationMap = [
    // These ones have no dependencies and can be copied wholesale
    {old: "formatter", new: "formatter"},
    {old: "images", new: "images"},
    {old: "search", new: "search"},
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
    // Selectors are going from a topic namespace to a profile-wide namespace. To avoid collision, add
    // the topic/section slug to the end of the selector
    const oldname = oldselector.name;
    const newname = `${oldname}-${oldtopic.slug}`;
    oldselector.name = newname;
    delete oldselector.topic_id;
    let newselector = await dbnew.selector.create(oldselector).catch(catcher);
    newselector = newselector.toJSON();
    await dbnew.section_selector.create({
      section_id: oldtopic.id,
      selector_id: newselector.id,
      ordering: oldselector.ordering
    }).catch(catcher);
    // Because we renamed the selector, all content and vizes that REFERENCE that selector must have
    // their content updated to match the new selector name.
    let newsection = await dbnew.section.findOne({where: {id: oldtopic.id}, include: sectionInclude}).catch(catcher);
    newsection = newsection.toJSON();
    let content = await dbnew.section_content.findOne({where: {id: newsection.id}}).catch(catcher);
    content = updateSelector(content.toJSON(), oldname, newname);
    await dbnew.section_content.update(content, {where: {id: newsection.id}}).catch(catcher);
    for (const list of ["descriptions", "subtitles", "stats", "visualizations"]) {
      for (const entity of newsection[list]) {
        const table = list === "visualizations" ? "section_visualization" : `section_${list.slice(0, -1)}_content`;
        let content = await dbnew[table].findOne({where: {id: entity.id}}).catch(catcher);
        content = updateSelector(content.toJSON(), oldname, newname);
        await dbnew[table].update(content, {where: {id: entity.id}}).catch(catcher);
      }
    }
  }
  await resetSequence(dbnew, "selector", "id");

  console.log(`Successfully migrated from CMS version 0.6 on ${oldDBName} to CMS version 0.7 on ${newDBName}`);
  shell.exit(0);
};

migrate();

return;
