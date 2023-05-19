const sequelize = require("sequelize");
const shell = require("shelljs");
const yn = require("yn");
const path = require("path");
const fs = require("fs");
const Op = sequelize.Op;

const populateSearch = require("../utils/populateSearch");
const {profileReqFull, storyReqFull, sectionReqFull, storysectionReqFull, cmsTables, contentTables, parentOrderingTables} = require("../utils/sequelize/models");
const {translateProfile, translateSection, fetchUpsertHelpers} = require("../utils/translation/translationUtils");

const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";
const verbose = yn(process.env.CANON_CMS_LOGGING);

const sectionTypeDir = path.join(__dirname, "../components/sections/");
const sectionTypeDirCustom = path.join(process.cwd(), "app/cms/sections/");

const cmsCheck = () => process.env.NODE_ENV === "development" || yn(process.env.CANON_CMS_ENABLE);
const cmsMinRole = () => process.env.CANON_CMS_MINIMUM_ROLE ? Number(process.env.CANON_CMS_MINIMUM_ROLE) : 1;

const stripID = o => {
  delete o.id;
  return o;
};

const isEnabled = (req, res, next) => {
  if (cmsCheck()) return next();
  return res.status(401).send("Not Authorized");
};

const catcher = e => {
  if (verbose) {
    console.error("Error in cmsRoute: ", e.message);
  }
  return [];
};

const sorter = (a, b) => a.ordering - b.ordering;

/**
 * Due to yet-unreproducible edge cases, sometimes elements lose their ordering.
 * This function sorts an array, then checks if the "ordering" property lines up
 * with the element's place in the array. If not, "patch" the element and send it back
 * to the client, and asynchronously send an update to the db to match it.
 */
const flatSort = (conn, array) => {
  if (!array) return [];
  array.sort(sorter).map((o, i) => {
    if (o.ordering !== i) {
      o.ordering = i;
      conn.update({ordering: i}, {where: {id: o.id}});
    }
    return o;
  });
  return array;
};

const bubbleSortSelectors = (conn, selectors, accessor = "section_selector") => {
  selectors = selectors
    .map(s => Object.assign({}, s, {ordering: s[accessor].ordering}))
    .sort(sorter);
  selectors.forEach((o, i) => {
    if (o.ordering !== i) {
      o.ordering = i;
      o[accessor].ordering = i;
      conn.update({ordering: i}, {where: {id: o[accessor].id}}).catch(catcher);
    }
  });
  return selectors;
};


// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. todo: move it up to the query.
const sortProfileTree = (db, profiles) => {
  profiles = profiles.map(p => p.toJSON());
  profiles = flatSort(db.profile, profiles);
  profiles.forEach(p => {
    // Don't use flatSort for meta. Meta can have multiple entities in the same ordering, so do not attempt to "flatten" them out
    p.meta = p.meta.sort(sorter);
    p.sections = flatSort(db.section, p.sections);
    p.materializers = flatSort(db.materializer, p.materializers);
  });
  return profiles;
};

const sortStoryTree = (db, stories) => {
  stories = stories.map(s => s.toJSON());
  stories = flatSort(db.story, stories);
  stories.forEach(s => {
    s.storysections = flatSort(db.storysection, s.storysections);
  });
  return stories;
};

const sortProfile = (db, profile) => {
  // Don't use flatSort for meta. Meta can have multiple entities in the same ordering, so do not attempt to "flatten" them out
  profile.meta = profile.meta.sort(sorter);
  profile.materializers = flatSort(db.materializer, profile.materializers);
  profile.sections = flatSort(db.section, profile.sections);
  return profile;
};

const sortStory = (db, story) => {
  story.descriptions = flatSort(db.story_description, story.descriptions);
  story.footnotes = flatSort(db.story_footnote, story.footnotes);
  story.authors = flatSort(db.author, story.authors);
  return story;
};

const sortSection = (db, section) => {
  section.subtitles = flatSort(db.section_subtitle, section.subtitles);
  section.visualizations = flatSort(db.section_visualization, section.visualizations);
  section.stats = flatSort(db.section_stat, section.stats);
  section.descriptions = flatSort(db.section_description, section.descriptions);
  // ordering is nested in section_selector - bubble for top-level sorting
  section.selectors = bubbleSortSelectors(db.section_selector, section.selectors);
  return section;
};

const sortStorySection = (db, storysection) => {
  storysection.subtitles = flatSort(db.storysection_subtitle, storysection.subtitles);
  storysection.visualizations = flatSort(db.storysection_visualization, storysection.visualizations);
  storysection.stats = flatSort(db.storysection_stat, storysection.stats);
  storysection.descriptions = flatSort(db.storysection_description, storysection.descriptions);
  // ordering is nested in section_selector - bubble for top-level sorting
  storysection.selectors = bubbleSortSelectors(db.storysection_selector, storysection.selectors, "storysection_selector");
  return storysection;
};

const getSectionTypes = () => {
  const sectionTypes = [];
  shell.ls(`${sectionTypeDir}*.jsx`).forEach(file => {
    // In Windows, the shell.ls command returns forward-slash separated directories,
    // but the node "path" command returns backslash separated directories. Flip the slashes
    // so the ensuing replace operation works (this should be a no-op for *nix/osx systems)
    const sectionTypeDirFixed = sectionTypeDir.replace(/\\/g, "/");
    const compName = file.replace(sectionTypeDirFixed, "").replace(".jsx", "");
    if (compName !== "Section") sectionTypes.push(compName);
  });
  if (fs.existsSync(sectionTypeDirCustom)) {
    shell.ls(`${sectionTypeDirCustom}*.jsx`).forEach(file => {
      const sectionTypeDirCustomFixed = sectionTypeDirCustom.replace(/\\/g, "/");
      const compName = file.replace(sectionTypeDirCustomFixed, "").replace(".jsx", "");
      sectionTypes.push(compName);
    });
  }
  return sectionTypes;
};

const duplicateSection = async(db, oldSection, pid, selectorLookup) => {
  // Create a new section, but with the new profile id.
  const newSection = await db.section.create(Object.assign({}, stripID(oldSection), {profile_id: pid}));
  // Clone language content with new id
  const newSectionContent = oldSection.content.map(d => Object.assign({}, d, {id: newSection.id}));
  await db.section_content.bulkCreate(newSectionContent).catch(catcher);
  // Clone subtitles, descriptions, and stats, AND their content, and vizes and selectors
  const entities = ["subtitle", "description", "stat", "visualization"];
  // Only copy selectors if this is a full profile copy, i.e., selectorLookup was provided.
  if (selectorLookup) entities.push("selector");
  for (const entity of entities) {
    const newRows = oldSection[`${entity}s`].map(d => {
      // If the entity is a selector, replace its selector id with the newly cloned selector (created above in lookup)
      if (entity === "selector") {
        const s = d.section_selector;
        return Object.assign({}, stripID(s), {section_id: newSection.id, selector_id: selectorLookup[s.selector_id]});
      }
      // Otherwise, simple overwrite the section id and delete the id as usual
      else {
        return Object.assign({}, stripID(d), {section_id: newSection.id});
      }
    });
    for (const newRow of newRows) {
      // Insert the actual entity row
      const newEntity = await db[`section_${entity}`].create(newRow).catch(catcher);
      // If this entity has content, Insert it.
      if (["subtitle", "description", "stat"].includes(entity)) {
        const newEntityContent = newRow.content.map(d => Object.assign({}, d, {id: newEntity.id}));
        await db[`section_${entity}_content`].bulkCreate(newEntityContent).catch(catcher);
      }
    }
  }
  return newSection.id;
};

const pruneSearch = async(cubeName, dimension, levels, db) => {
  const currentMeta = await db.profile_meta.findAll().catch(catcher);
  const dimensionCubePairs = currentMeta.reduce((acc, d) => acc.concat(`${d.dimension}-${d.cubeName}`), []);

  // To be on the safe side, only clear the search table of dimensions that NO remaining
  // profiles are currently making use of.
  // Don't need to prune levels - they will be filtered automatically in searches.
  // If it gets unwieldy in size however, an optimization could be made here
  if (!dimensionCubePairs.includes(`${dimension}-${cubeName}`)) {
    const resp = await db.search.destroy({where: {dimension, cubeName}}).catch(catcher);
    if (verbose) console.log(`Cleaned up search data. Rows affected: ${resp}`);
  }
  else {
    if (verbose) console.log(`Skipped earch cleanup - ${dimension}/${cubeName} is still in use`);
  }
};

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/cms", (req, res) => res.json(cmsCheck()));
  app.get("/api/cms/minRole", (req, res) => res.json(cmsMinRole()));

  app.get("/api/cms/audit", async(req, res) => {
    const variable = req.query.variable.toLowerCase();
    const contains = obj => Object.keys(obj).some(d =>
      typeof obj[d] === "string" &&
      (obj[d].toLowerCase().includes(`{{${variable}}}`) ||
      obj[d].toLowerCase().includes(variable)));
    const profiles = await db.profile.findAll(profileReqFull).then(d => d.map(o => o.toJSON())).catch(catcher);

    const results = [];
    let varCount = 0;

    for (const profile of profiles) {
      const thisname = profile.meta.reduce((acc, d) => `${acc}/${d.slug}`, "");
      results.push(`PROFILE ${thisname}`);
      for (const content of profile.content) {
        if (contains(content)) {
          results.push(content);
          varCount++;
        }
      }
      results.push(`MATERIALIZERS ${thisname}`);
      for (const materializer of profile.materializers) {
        if (contains(materializer)) {
          results.push(materializer);
          varCount++;
        }
      }
      results.push(`SELECTORS ${thisname}`);
      for (const selector of profile.selectors) {
        if (contains(selector)) {
          results.push(selector);
          varCount++;
        }
      }
      for (const section of profile.sections) {
        const thisname = section.content && section.content[0] && section.content[0].title || section.slug || section.id;
        results.push(`SECTION ${thisname}`);
        for (const content of section.content) {
          if (contains(content)) {
            results.push(content);
            varCount++;
          }
        }
        for (const entities of ["stats", "descriptions", "subtitles", "visualizations"]) {
          for (const entity of section[entities]) {
            results.push(entities.toUpperCase());
            if (contains(entity)) {
              results.push(entity);
              varCount++;
            }
            if (entity.content) {
              for (const content of entity.content) {
                if (contains(content)) {
                  varCount++;
                  results.push(content);
                }
              }
            }
          }
        }
      }
    }
    return res.json({
      count: varCount,
      results
    });
  });

  /* BASIC GETS */

  // Top-level tables have their own special gets, so exclude them from the "simple" gets
  const getList = cmsTables.filter(tableName =>
    !["profile", "section", "story", "storysection"].includes(tableName)
  );

  getList.forEach(ref => {
    app.get(`/api/cms/${ref}/get/:id`, async(req, res) => {
      console.log("at a get");
      if (contentTables.includes(ref)) {
        const u = await db[ref].findOne({where: {id: req.params.id}, include: {association: "content"}}).catch(catcher);
        return res.json(u);
      }
      else {
        const u = await db[ref].findOne({where: {id: req.params.id}}).catch(catcher);
        return res.json(u);
      }
    });
  });

  app.get("/api/cms/meta", async(req, res) => {
    let meta = await db.profile_meta.findAll().catch(catcher);
    meta = meta.map(m => m.toJSON());
    for (const m of meta) {
      m.top = await db.search.findOne({where: {dimension: m.dimension, cubeName: m.cubeName}, order: [["zvalue", "DESC"]], limit: 1}).catch(catcher);
    }
    res.json(meta);
  });

  app.get("/api/cms/tree", async(req, res) => {
    let profiles = await db.profile.findAll(profileReqFull).catch(catcher);
    profiles = sortProfileTree(db, profiles);
    profiles.forEach(profile => {
      profile.sections = profile.sections.map(section => {
        section = sortSection(db, section);
        section.types = getSectionTypes();
        return section;
      });
      return profile;
    });
    return res.json(profiles);
  });

  /**
   * Returns a list of profiles including both the meta and content associations
   * for the current language. Primarily used by the ProfileSearch component.
   */
  app.get("/api/cms/profiles", async(req, res) => {
    let meta = await db.profile.findAll({
      include: [
        {association: "meta", separate: true},
        {association: "content", separate: true}
      ]
    }).catch(catcher);
    meta = meta.map(m => m.toJSON());
    const locale = req.query.locale ? req.query.locale : envLoc;
    meta.forEach(m => {
      if (m.content instanceof Array) {
        m.content = m.content.find(c => c.locale === locale) ||
          m.content.find(c => c.locale === envLoc) ||
           m[0];
      }
    });
    res.json(meta);
  });

  app.get("/api/cms/formatter", async(req, res) => {
    const formatters = await db.formatter.findAll().catch(catcher);
    res.json(formatters);
  });

  app.get("/api/cms/storytree", async(req, res) => {
    let stories = await db.story.findAll(storyReqFull).catch(catcher);
    stories = sortStoryTree(db, stories);
    stories.forEach(story => {
      story.storysections = story.storysections.map(storysection => {
        storysection = sortStorySection(db, storysection);
        storysection.types = getSectionTypes();
        return storysection;
      });
      return story;
    });
    return res.json(stories);
  });

  /* BASIC INSERTS */
  const newList = cmsTables;
  newList.forEach(ref => {
    app.post(`/api/cms/${ref}/new`, isEnabled, async(req, res) => {
      // If the order was provided, we need to bump all siblings up to make room.
      if (req.body.ordering) {
        const where = {
          ordering: {[Op.gte]: req.body.ordering},
          [parentOrderingTables[ref]]: req.body[parentOrderingTables[ref]]
        };
        await db[ref].update({ordering: sequelize.literal("ordering +1")}, {where}).catch(catcher);
      }
      // If it was not provided, but this is a table that needs them, append it to the end and
      // insert the derived ordering into req.body
      else if (parentOrderingTables[ref]) {
        const where = {
          where: {[parentOrderingTables[ref]]: req.body[parentOrderingTables[ref]]},
          attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]],
          raw: true
        };
        const maxFetch = await db[ref].findAll(where).catch(catcher);
        const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
        req.body.ordering = ordering;
      }
      // First, create the metadata object in the top-level table
      const newObj = await db[ref].create(req.body).catch(catcher);
      // For a certain subset of translated tables, we need to also insert a new, corresponding english content row.
      if (contentTables.includes(ref)) {
        const payload = Object.assign({}, req.body, {id: newObj.id, locale: envLoc});
        await db[`${ref}_content`].create(payload).catch(catcher);
        let reqObj;
        if (ref === "section") {
          reqObj = Object.assign({}, sectionReqFull, {where: {id: newObj.id}});
        }
        else if (ref === "storysection") {
          reqObj = Object.assign({}, storysectionReqFull, {where: {id: newObj.id}});
        }
        else {
          reqObj = {where: {id: newObj.id}, include: {association: "content"}};
        }
        let fullObj = await db[ref].findOne(reqObj).catch(catcher);
        fullObj = fullObj.toJSON();
        if (ref === "section" || ref === "storysection") {
          fullObj.types = getSectionTypes();
        }
        return res.json(fullObj);
      }
      else {
        if (ref === "section_selector") {
          let selector = await db.selector.findOne({where: {id: req.body.selector_id}}).catch(catcher);
          selector = selector.toJSON();
          selector.section_selector = newObj.toJSON();
          return res.json(selector);
        }
        if (ref === "storysection_selector") {
          let story_selector = await db.story_selector.findOne({where: {id: req.body.story_selector_id}}).catch(catcher);  // eslint-disable-line
          story_selector = story_selector.toJSON(); // eslint-disable-line
          story_selector.storysection_selector = newObj.toJSON();
          return res.json(story_selector);
        }
        else {
          return res.json(newObj);
        }
      }
    });
  });

  /* CUSTOM INSERTS */
  app.post("/api/cms/profile/newScaffold", isEnabled, async(req, res) => {
    const maxFetch = await db.profile.findAll({attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]], raw: true}).catch(catcher);
    const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
    const profile = await db.profile.create({ordering}).catch(catcher);
    await db.profile_content.create({id: profile.id, locale: envLoc}).catch(catcher);
    const section = await db.section.create({ordering: 0, type: "Hero", profile_id: profile.id});
    await db.section_content.create({id: section.id, locale: envLoc}).catch(catcher);
    const reqObj = Object.assign({}, profileReqFull, {where: {id: profile.id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => {
      section = sortSection(db, section);
      section.types = getSectionTypes();
      return section;
    });
    return res.json(newProfile);
  });

  app.post("/api/cms/story/newScaffold", isEnabled, async(req, res) => {
    const maxFetch = await db.story.findAll({attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]], raw: true}).catch(catcher);
    const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
    const story = await db.story.create({ordering}).catch(catcher);
    await db.story_content.create({id: story.id, locale: envLoc}).catch(catcher);
    const storysection = await db.storysection.create({ordering: 0, type: "Hero", story_id: story.id});
    await db.storysection_content.create({id: storysection.id, locale: envLoc}).catch(catcher);
    const reqObj = Object.assign({}, storyReqFull, {where: {id: story.id}});
    let newStory = await db.story.findOne(reqObj).catch(catcher);
    newStory = sortStory(db, newStory.toJSON());
    newStory.storysection = newStory.storysections.map(storysection => {
      storysection = sortStorySection(db, storysection);
      storysection.types = getSectionTypes();
      return storysection;
    });
    return res.json(newStory);
  });

  app.post("/api/cms/profile/upsertDimension", isEnabled, async(req, res) => {
    req.setTimeout(1000 * 60 * 5);
    const {profileData, includeAllMembers} = req.body;
    const {profile_id} = profileData;  // eslint-disable-line
    profileData.dimension = profileData.dimName;
    const oldmeta = await db.profile_meta.findOne({where: {id: profileData.id || null}}).catch(catcher);
    // Inserts are simple
    if (!oldmeta) {
      // If no ordering was provided, divine ordering from meta length.
      if (isNaN(profileData.ordering)) {
        const maxFetch = await db.profile_meta.findAll({where: {profile_id}, attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]], raw: true}).catch(catcher);
        const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
        profileData.ordering = ordering;
      }
      await db.profile_meta.create(profileData);
      await populateSearch(profileData, db, false, false, includeAllMembers);
    }
    // Updates are more complex - the user may have changed levels, or even modified the dimension
    // entirely. We have to prune the search before repopulating it.
    else {
      await db.profile_meta.update(profileData, {where: {id: profileData.id || null}});
      if (oldmeta.cubeName !== profileData.cubeName || oldmeta.dimension !== profileData.dimension || oldmeta.levels.join() !== profileData.levels.join()) {
        pruneSearch(oldmeta.cubeName, oldmeta.dimension, oldmeta.levels, db);
        await populateSearch(profileData, db, false, false, includeAllMembers);
      }
    }
    const reqObj = Object.assign({}, profileReqFull, {where: {id: profile_id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => {
      section = sortSection(db, section);
      section.types = getSectionTypes();
      return section;
    });
    return res.json(newProfile);
  });

  app.post("/api/cms/repopulateSearch", isEnabled, async(req, res) => {
    req.setTimeout(1000 * 60 * 5);
    const {id, newSlugs, includeAllMembers} = req.body;
    let profileData = await db.profile_meta.findOne({where: {id}});
    profileData = profileData.toJSON();
    await populateSearch(profileData, db, false, newSlugs, includeAllMembers);
    return res.json({});
  });

  /* BASIC UPDATES */
  const updateList = cmsTables;
  updateList.forEach(ref => {
    app.post(`/api/cms/${ref}/update`, isEnabled, async(req, res) => {
      const {id} = req.body;
      await db[ref].update(req.body, {where: {id}}).catch(catcher);
      if (contentTables.includes(ref) && req.body.content) {
        for (const content of req.body.content) {
          await db[`${ref}_content`].upsert(content, {where: {id, locale: content.locale}}).catch(catcher);
        }
      }
      // Formatters are a special update case - return the whole list on update (necessary for recompiling them)
      if (ref === "formatter") {
        const rows = await db.formatter.findAll().catch(catcher);
        return res.json({id, formatters: rows});
      }
      else {
        if (contentTables.includes(ref)) {
          const u = await db[ref].findOne({where: {id}, include: {association: "content"}}).catch(catcher);
          return res.json(u);
        }
        else {
          const u = await db[ref].findOne({where: {id}}).catch(catcher);
          return res.json(u);
        }
      }
    });
  });

  /* SWAPS */
  /**
   * To handle swaps, this list contains objects with two properties. "elements" refers to the tables to be modified,
   * and "parent" refers to the foreign key that need be referenced in the associated where clause.
   */
  const swapList = [
    {elements: ["profile"], parent: null},
    {elements: ["author", "story_description", "story_footnote"], parent: "story_id"},
    {elements: ["materializer"], parent: "profile_id"},
    {elements: ["story_materializer"], parent: "story_id"},
    {elements: ["section_subtitle", "section_description", "section_stat", "section_visualization"], parent: "section_id"},
    {elements: ["storysection_subtitle", "storysection_description", "storysection_stat", "storysection_visualization"], parent: "storysection_id"}
  ];
  swapList.forEach(list => {
    list.elements.forEach(ref => {
      app.post(`/api/cms/${ref}/swap`, isEnabled, async(req, res) => {
        const {id} = req.body;
        const original = await db[ref].findOne({where: {id}}).catch(catcher);
        const otherWhere = {ordering: original.ordering + 1};
        if (list.parent) otherWhere[list.parent] = original[list.parent];
        const other = await db[ref].findOne({where: otherWhere}).catch(catcher);
        if (!original || !other) return res.json([]);
        const originalTarget = other.ordering;
        const otherTarget = original.ordering;
        const newOriginal = await db[ref].update({ordering: originalTarget}, {where: {id}, returning: true, plain: true}).catch(catcher);
        const newOther = await db[ref].update({ordering: otherTarget}, {where: {id: other.id}, returning: true, plain: true}).catch(catcher);
        return res.json([newOriginal[1], newOther[1]]);
      });
    });
  });

  /* CUSTOM SWAPS */

  const sectionSwapList = [
    {ref: "section", parent: "profile_id"},
    {ref: "storysection", parent: "story_id"}
  ];
  sectionSwapList.forEach(swap => {
    app.post(`/api/cms/${swap.ref}/swap`, isEnabled, async(req, res) => {
      // Sections can be Groupings, which requires a more complex swap that brings it child sections along with it
      const {id} = req.body;
      const original = await db[swap.ref].findOne({where: {id}}).catch(catcher);
      let sections = await db[swap.ref].findAll({where: {[swap.parent]: original[swap.parent]}, order: [["ordering", "ASC"]]}).catch(catcher);
      sections = sections.map(s => s.toJSON());
      // Create a hierarchical array that respects groupings that looks like: [[G1, S1, S2], [G2, S3, S4, S5]] for easy swapping
      const sectionsGrouped = [];
      let hitGrouping = false;
      sections.forEach(section => {
        if (!hitGrouping || section.type === "Grouping") {
          sectionsGrouped.push([section]);
          if (section.type === "Grouping") hitGrouping = true;
        }
        else {
          sectionsGrouped[sectionsGrouped.length - 1].push(section);
        }
      });
      // Sections that come before the Groupings start are technically in groups of their own.
      let isGroupLeader = false;
      sectionsGrouped.forEach(group => {
        if (group.map(d => d.id).includes(original.id) && group[0].id === original.id) isGroupLeader = true;
      });
      let updatedSections = [];
      if (isGroupLeader) {
        const ogi = sectionsGrouped.findIndex(group => group[0].id === id);
        const ngi = ogi + 1;
        // https://stackoverflow.com/a/872317
        [sectionsGrouped[ogi], sectionsGrouped[ngi]] = [sectionsGrouped[ngi], sectionsGrouped[ogi]];
        updatedSections = sectionsGrouped
          .flat()
          .map((section, i) => ({...section, ordering: i}));
      }
      else {
        const oi = original.ordering;
        const ni = original.ordering + 1;
        [sections[oi], sections[ni]] = [sections[ni], sections[oi]];
        updatedSections = sections.map((section, i) => ({...section, ordering: i}));
      }
      for (const section of updatedSections) {
        await db[swap.ref].update({ordering: section.ordering}, {where: {id: section.id}});
      }
      return res.json(updatedSections.map(d => ({id: d.id, ordering: d.ordering})));
    });
  });


  app.post("/api/cms/section_selector/swap", isEnabled, async(req, res) => {
    const {id} = req.body;
    const original = await db.section_selector.findOne({where: {id}}).catch(catcher);
    const otherWhere = {ordering: original.ordering + 1, section_id: original.section_id};
    const other = await db.section_selector.findOne({where: otherWhere}).catch(catcher);
    await db.section_selector.update({ordering: sequelize.literal("ordering + 1")}, {where: {id}}).catch(catcher);
    await db.section_selector.update({ordering: sequelize.literal("ordering - 1")}, {where: {id: other.id}}).catch(catcher);
    const reqObj = {where: {id: original.section_id}, include: [{association: "selectors"}]};
    let section = await db.section.findOne(reqObj).catch(catcher);
    let rows = [];
    if (section) {
      section = section.toJSON();
      section.selectors = bubbleSortSelectors(db.section_selector, section.selectors);
      rows = section.selectors;
    }
    return res.json({parent_id: original.section_id, selectors: rows});
  });

  app.post("/api/cms/storysection_selector/swap", isEnabled, async(req, res) => {
    const {id} = req.body;
    const original = await db.storysection_selector.findOne({where: {id}}).catch(catcher);
    const otherWhere = {ordering: original.ordering + 1, storysection_id: original.storysection_id};
    const other = await db.storysection_selector.findOne({where: otherWhere}).catch(catcher);
    await db.storysection_selector.update({ordering: sequelize.literal("ordering + 1")}, {where: {id}}).catch(catcher);
    await db.storysection_selector.update({ordering: sequelize.literal("ordering - 1")}, {where: {id: other.id}}).catch(catcher);
    const reqObj = {where: {id: original.storysection_id}, include: [{association: "selectors"}]};
    let storysection = await db.storysection.findOne(reqObj).catch(catcher);
    let rows = [];
    if (storysection) {
      storysection = storysection.toJSON();
      storysection.selectors = bubbleSortSelectors(db.storysection_selector, storysection.selectors, "storysection_selector");
      rows = storysection.selectors;
    }
    return res.json({parent_id: original.storysection_id, selectors: rows});
  });

  /* DUPLICATES */

  app.post("/api/cms/section/duplicate", isEnabled, async(req, res) => {
    const {id, pid} = req.body;
    const reqObj = Object.assign({}, sectionReqFull, {where: {id}});
    let oldSection = await db.section.findOne(reqObj).catch(catcher);
    oldSection = oldSection.toJSON();
    let selectorLookup = null;
    // If this section is being duplicated in the SAME profile as it came from, we DO want to populate its selectors
    // (We skip selectors if we jump profiles). Populate a dummy lookup so the selector migration works.
    if (pid === oldSection.profile_id) {
      selectorLookup = {};
      oldSection.selectors.forEach(selector => {
        selectorLookup[selector.section_selector.selector_id] = selector.section_selector.selector_id;
      });
      // Because this is the same profile, we want its ordering to be after the duplication source.
      // Slide up all of the other sections to make room
      await db.section.update({ordering: sequelize.literal("ordering +1")}, {where: {profile_id: pid, ordering: {[Op.gt]: oldSection.ordering}}}).catch(catcher);
      // Then override the ordering of oldSection to be after the source one (i.e., one higher)
      oldSection.ordering++;
    }
    else {
      // If this section is being added to a different profile, override its ordering to be the last in the list.
      const maxFetch = await db.section.findAll({where: {profile_id: pid}, attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]], raw: true}).catch(catcher);
      const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
      oldSection.ordering = ordering;
    }
    const newSectionId = await duplicateSection(db, oldSection, pid, selectorLookup);
    const newReqObj = Object.assign({}, sectionReqFull, {where: {id: newSectionId}});
    let newSection = await db.section.findOne(newReqObj).catch(catcher);
    newSection = newSection.toJSON();
    newSection = sortSection(db, newSection);
    newSection.types = getSectionTypes();
    return res.json(newSection);
  });

  app.post("/api/cms/profile/duplicate", isEnabled, async(req, res) => {
    // Fetch the full tree for the provided ID
    const reqObj = Object.assign({}, profileReqFull, {where: {id: req.body.id}});
    let oldProfile = await db.profile.findOne(reqObj).catch(catcher);
    oldProfile = oldProfile.toJSON();
    // Make a new Profile
    const maxFetch = await db.profile.findAll({attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]], raw: true}).catch(catcher);
    const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
    const newProfile = await db.profile.create({ordering}).catch(catcher);
    // Clone meta with new slugs
    const newMeta = oldProfile.meta.map(d => Object.assign({}, stripID(d), {profile_id: newProfile.id, slug: `${d.slug}-${newProfile.id}`}));
    await db.profile_meta.bulkCreate(newMeta).catch(catcher);
    // Clone language content with new id
    const newProfileContent = oldProfile.content.map(d => Object.assign({}, d, {id: newProfile.id}));
    await db.profile_content.bulkCreate(newProfileContent).catch(catcher);
    // Clone generators, materializers
    for (const table of ["generator", "materializer"]) {
      const newRows = oldProfile[`${table}s`].map(d => Object.assign({}, stripID(d), {profile_id: newProfile.id}));
      await db[table].bulkCreate(newRows).catch(catcher);
    }
    // Profile-level selectors are being cloned, and will receive a new id. When we later clone section_selector, it will need
    // to have its selector_id updated to the NEWLY created selector's id. Create a lookup object for this.
    const selectorLookup = {};
    for (const oldSelector of oldProfile.selectors) {
      const oldid = oldSelector.id;
      const newSelector = await db.selector.create(Object.assign({}, stripID(oldSelector), {profile_id: newProfile.id})).catch(catcher);
      selectorLookup[oldid] = newSelector.id;
    }
    // Clone Sections
    for (const oldSection of oldProfile.sections) {
      await duplicateSection(db, oldSection, newProfile.id, selectorLookup);
    }
    // Now that all the creations are complete, fetch a new hierarchical and sorted profile.
    const finalReqObj = Object.assign({}, profileReqFull, {where: {id: newProfile.id}});
    let finalProfile = await db.profile.findOne(finalReqObj).catch(catcher);
    finalProfile = sortProfile(db, finalProfile.toJSON());
    finalProfile.sections = finalProfile.sections.map(section => {
      section = sortSection(db, section);
      section.types = getSectionTypes();
      return section;
    });
    return res.json(finalProfile);
  });

  const duplicateList = ["selector", "generator", "materializer"];

  duplicateList.forEach(ref => {
    app.post(`/api/cms/${ref}/duplicate`, isEnabled, async(req, res) => {
      let entity = await db[ref].findOne({where: {id: req.body.id}}).catch(catcher);
      entity = entity.toJSON();
      const {id, ...duplicate} = entity; //eslint-disable-line
      if (duplicate.name) duplicate.name = `${duplicate.name}-duplicate`;
      if (duplicate.title) duplicate.title = `${duplicate.title} (duplicate)`;
      // Todo: make this more generic. Extract out the /new code have duplicate use it.
      if (ref === "materializer") {
        await db[ref].update({ordering: sequelize.literal("ordering +1")}, {where: {profile_id: entity.profile_id, ordering: {[Op.gt]: entity.ordering}}}).catch(catcher);
        duplicate.ordering++;
      }
      const newEntity = await db[ref].create(duplicate).catch(catcher);
      return res.json(newEntity);
    });
  });

  /* TRANSLATIONS */
  /** Translations are provided by the Google API and require an authentication key. They are requested client-side for
   * card-by-card translations (allowing for in-place editing) but can be batch-translated here.
   */
  app.post("/api/cms/section/translate", async(req, res) => {
    const sid = req.body.id;
    const {variables, source, target} = req.body;
    const reqObj = Object.assign({}, sectionReqFull, {where: {id: sid}});
    let section = await db.section.findOne(reqObj);
    section = section.toJSON();
    const helpers = await fetchUpsertHelpers(db, section.profile_id, source);
    const {formatterFunctions, allSelectors} = helpers;
    const config = {variables, source, target, formatterFunctions, allSelectors};
    const error = await translateSection(db, section, config);
    if (error) return res.json({error});
    // If there were no errors, fetch and return updated section
    const newReqObj = Object.assign({}, sectionReqFull, {where: {id: sid}});
    let newSection = await db.section.findOne(newReqObj).catch(catcher);
    newSection = newSection.toJSON();
    newSection = sortSection(db, newSection);
    newSection.types = getSectionTypes();
    return res.json(newSection);
  });

  app.post("/api/cms/profile/translate", async(req, res) => {
    const pid = req.body.id;
    const {variables, source, target} = req.body;
    const config = {variables, source, target};
    const error = await translateProfile(db, pid, config);
    if (error) return res.json({error});
    // If there were no errors, fetch and return updated profile
    const reqObj = Object.assign({}, profileReqFull, {where: {id: pid}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    const sectionTypes = getSectionTypes();
    newProfile.sections = newProfile.sections.map(section => {
      section = sortSection(db, section);
      section.types = sectionTypes;
      return section;
    });
    return res.json(newProfile);
  });

  /* DELETES */
  /**
   * To streamline deletes, this list contains objects with two properties. "elements" refers to the tables to be modified,
   * and "parent" refers to the foreign key that need be referenced in the associated where clause.
   */
  const deleteList = [
    {elements: ["author", "story_description", "story_footnote"], parent: "story_id"},
    {elements: ["section_subtitle", "section_description", "section_stat", "section_visualization"], parent: "section_id"},
    {elements: ["storysection_subtitle", "storysection_description", "storysection_stat", "storysection_visualization"], parent: "storysection_id"}
  ];

  deleteList.forEach(list => {
    list.elements.forEach(ref => {
      app.delete(`/api/cms/${ref}/delete`, isEnabled, async(req, res) => {
        const row = await db[ref].findOne({where: {id: req.query.id}}).catch(catcher);
        // Construct a where clause that looks someting like: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}
        // except "profile_id" is the "parent" in the array above
        const where1 = {ordering: {[Op.gt]: row.ordering}};
        where1[list.parent] = row[list.parent];
        await db[ref].update({ordering: sequelize.literal("ordering -1")}, {where: where1}).catch(catcher);
        await db[ref].destroy({where: {id: req.query.id}}).catch(catcher);
        const where2 = {};
        where2[list.parent] = row[list.parent];
        const reqObj = {where: where2, order: [["ordering", "ASC"]]};
        if (contentTables.includes(ref)) reqObj.include = {association: "content"};
        const rows = await db[ref].findAll(reqObj).catch(catcher);
        return res.json({parent_id: row[list.parent], newArray: rows});
      });
    });
  });

  /* CUSTOM DELETES */
  app.delete("/api/cms/generator/delete", isEnabled, async(req, res) => {
    const row = await db.generator.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.generator.destroy({where: {id: req.query.id}});
    const generators = await db.generator.findAll({where: {profile_id: row.profile_id}}).catch(catcher);
    return res.json({id: req.query.id, parent_id: row.profile_id, generators});
  });

  app.delete("/api/cms/story_generator/delete", isEnabled, async(req, res) => {
    const row = await db.story_generator.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.generator.destroy({where: {id: req.query.id}});
    const generators = await db.story_generator.findAll({where: {story_id: row.story_id}}).catch(catcher);
    return res.json({id: req.query.id, parent_id: row.story_id, generators});
  });

  app.delete("/api/cms/materializer/delete", isEnabled, async(req, res) => {
    const row = await db.materializer.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.materializer.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.materializer.destroy({where: {id: req.query.id}}).catch(catcher);
    const materializers = await db.materializer.findAll({where: {profile_id: row.profile_id}, order: [["ordering", "ASC"]]}).catch(catcher);
    return res.json({id: req.query.id, parent_id: row.profile_id, materializers});
  });

  app.delete("/api/cms/story_materializer/delete", isEnabled, async(req, res) => {
    const row = await db.materializer.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.materializer.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.materializer.destroy({where: {id: req.query.id}}).catch(catcher);
    const materializers = await db.materializer.findAll({where: {profile_id: row.profile_id}, order: [["ordering", "ASC"]]}).catch(catcher);
    return res.json({id: req.query.id, parent_id: row.profile_id, materializers});
  });

  app.delete("/api/cms/selector/delete", isEnabled, async(req, res) => {
    const row = await db.selector.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.selector.destroy({where: {id: req.query.id}});
    const selectors = await db.selector.findAll({where: {profile_id: row.profile_id}}).catch(catcher);
    return res.json({id: row.id, parent_id: row.profile_id, selectors});
  });

  app.delete("/api/cms/story_selector/delete", isEnabled, async(req, res) => {
    const row = await db.story_selector.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.story_selector.destroy({where: {id: req.query.id}});
    const selectors = await db.story_selector.findAll({where: {story_id: row.story_id}}).catch(catcher);
    return res.json({id: row.id, parent_id: row.story_id, selectors});
  });

  app.delete("/api/cms/section_selector/delete", isEnabled, async(req, res) => {
    const {selector_id, section_id} = req.query; // eslint-disable-line camelcase
    const row = await db.section_selector.findOne({where: {selector_id, section_id}}).catch(catcher);
    await db.section_selector.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.section_selector.destroy({where: {selector_id, section_id}});
    const reqObj = {where: {id: row.section_id}, include: [{association: "selectors"}]};
    let section = await db.section.findOne(reqObj).catch(catcher);
    let rows = [];
    if (section) {
      section = section.toJSON();
      section.selectors = bubbleSortSelectors(db.section_selector, section.selectors);
      rows = section.selectors;
    }
    return res.json({parent_id: row.section_id, selectors: rows});
  });

  app.delete("/api/cms/storysection_selector/delete", isEnabled, async(req, res) => {
    const {story_selector_id, storysection_id} = req.query; // eslint-disable-line camelcase
    const row = await db.storysection_selector.findOne({where: {story_selector_id, storysection_id}}).catch(catcher);
    await db.storysection_selector.update({ordering: sequelize.literal("ordering -1")}, {where: {storysection_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.storysection_selector.destroy({where: {story_selector_id, storysection_id}});
    const reqObj = {where: {id: row.storysection_id}, include: [{association: "selectors"}]};
    let storysection = await db.storysection.findOne(reqObj).catch(catcher);
    let rows = [];
    if (storysection) {
      storysection = storysection.toJSON();
      storysection.selectors = bubbleSortSelectors(db.storysection_selector, storysection.selectors, "storysection_selector");
      rows = storysection.selectors;
    }
    return res.json({parent_id: row.storysection_id, selectors: rows});
  });

  app.delete("/api/cms/profile/delete", isEnabled, async(req, res) => {
    const row = await db.profile.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.profile.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.profile.destroy({where: {id: req.query.id}}).catch(catcher);
    // Todo: This prunesearch is outdated - need to call it multiple times for each meta row.
    // pruneSearch(row.dimension, row.levels, db);
    let profiles = await db.profile.findAll(profileReqFull).catch(catcher);
    profiles = sortProfileTree(db, profiles);
    const sectionTypes = getSectionTypes();
    profiles.forEach(profile => {
      profile.sections = profile.sections.map(section => {
        section = sortSection(db, section);
        section.types = sectionTypes;
        return section;
      });
      return profile;
    });
    return res.json({id: row.id, profiles});
  });

  app.delete("/api/cms/profile_meta/delete", isEnabled, async(req, res) => {
    const row = await db.profile_meta.findOne({where: {id: req.query.id}}).catch(catcher);
    // Profile meta can have multiple variants now sharing the same index.
    const variants = await db.profile_meta.findAll({where: {profile_id: row.profile_id, ordering: row.ordering}}).catch(catcher);
    // Only "slide down" others if we are deleting the last one at this ordering.
    if (variants.length === 1) {
      await db.profile_meta.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    }
    await db.profile_meta.destroy({where: {id: req.query.id}}).catch(catcher);
    pruneSearch(row.cubeName, row.dimension, row.levels, db);
    const reqObj = Object.assign({}, profileReqFull, {where: {id: row.profile_id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    const sectionTypes = getSectionTypes();
    newProfile.sections = newProfile.sections.map(section => {
      section = sortSection(db, section);
      section.types = sectionTypes;
      return section;
    });
    return res.json(newProfile);
  });

  app.delete("/api/cms/story/delete", isEnabled, async(req, res) => {
    const row = await db.story.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.story.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.story.destroy({where: {id: req.query.id}}).catch(catcher);
    let stories = await db.story.findAll(storyReqFull).catch(catcher);
    stories = sortStoryTree(db, stories);
    stories.forEach(story => {
      story.storysections = story.storysections.map(storysection => {
        storysection = sortStorySection(db, storysection);
        storysection.types = getSectionTypes();
        return storysection;
      });
      return story;
    });
    return res.json({id: row.id, stories});
  });

  app.delete("/api/cms/formatter/delete", isEnabled, async(req, res) => {
    await db.formatter.destroy({where: {id: req.query.id}}).catch(catcher);
    const rows = await db.formatter.findAll().catch(catcher);
    return res.json(rows);
  });

  app.delete("/api/cms/section/delete", isEnabled, async(req, res) => {
    const row = await db.section.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.section.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.section.destroy({where: {id: req.query.id}}).catch(catcher);
    const reqObj = Object.assign({}, sectionReqFull, {where: {profile_id: row.profile_id}, order: [["ordering", "ASC"]]});
    let sections = await db.section.findAll(reqObj).catch(catcher);
    sections = sections.map(section => {
      section = section.toJSON();
      section = sortSection(db, section);
      section.types = getSectionTypes();
      return section;
    });
    return res.json({id: row.id, parent_id: row.profile_id, sections});
  });

  app.delete("/api/cms/storysection/delete", isEnabled, async(req, res) => {
    const row = await db.storysection.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.storysection.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.storysection.destroy({where: {id: req.query.id}}).catch(catcher);
    const reqObj = Object.assign({}, storysectionReqFull, {where: {story_id: row.story_id}, order: [["ordering", "ASC"]]});
    let storysections = await db.storysection.findAll(reqObj).catch(catcher);
    storysections = storysections.map(storysection => {
      storysection = storysection.toJSON();
      storysection = sortStorySection(db, storysection);
      storysection.types = getSectionTypes();
      return storysection;
    });
    return res.json({id: row.id, parent_id: row.story_id, storysections});
  });

};
