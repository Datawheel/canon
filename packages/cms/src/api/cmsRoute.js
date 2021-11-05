const sequelize = require("sequelize"),
      Op = sequelize.Op, // eslint-disable-line
      yn = require("yn");

const populateSearch = require("../utils/populateSearch");
const {profileReqFull, sectionReqFull, cmsTables, contentTables, parentOrderingTables} = require("../utils/sequelize/ormHelpers");
const {translateProfile, translateSection, fetchUpsertHelpers} = require("../utils/translation/translationUtils");
// todo1.0 - unite this with getSectionTypes somehow
const {PROFILE_FIELDS, SECTION_TYPES} = require("../utils/consts/cms");

const defaultLocale = process.env.CANON_LANGUAGE_DEFAULT || "en";
const verbose = yn(process.env.CANON_CMS_LOGGING);

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

const bubbleSortInputs = () => [];

const contentReducer = (acc, d) => ({...acc, [d.locale]: d});

const sortProfile = (db, profile) => {
  // Don't use flatSort for meta. Meta can have multiple entities in the same ordering, so do not attempt to "flatten" them out
  profile.meta = profile.meta.sort(sorter);
  profile.contentByLocale = profile.contentByLocale.reduce(contentReducer, {});
  profile.sections = flatSort(db.section, profile.sections);
  return profile;
};

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. todo: move it up to the query.
const sortProfileTree = (db, profiles) => {
  profiles = profiles.map(p => p.toJSON());
  profiles = flatSort(db.profile, profiles);
  profiles.forEach(p => {
    sortProfile(db, p);
  });
  return profiles;
};

const sortSection = (db, section) => {
  section.contentByLocale = section.contentByLocale.reduce(contentReducer, {});
  section.blocks = flatSort(db.blocks, section.blocks);
  section.blocks.forEach(block => block.contentByLocale = block.contentByLocale.reduce(contentReducer, {}));
  // todo1.0
  // ordering is nested in section_selector - bubble for top-level sorting
  // section.selectors = bubbleSortSelectors(db.section_selector, section.selectors);
  return section;
};

const duplicateSection = async(db, oldSection, pid) => {
  // Create a new section, but with the new profile id.
  const newSection = await db.section.create({...stripID(oldSection), profile_id: pid});
  // Clone language content with new id
  const newSectionContent = oldSection.content.map(d => ({...d, id: newSection.id}));
  await db.section_content.bulkCreate(newSectionContent).catch(catcher);
  const newRows = oldSection.blocks.map(d => ({...stripID(d), section_id: newSection.id}));
  for (const newRow of newRows) {
    const newBlock = await db.blocks.create(newRow).catch(catcher);
    const newBlockContent = newRow.contentByLocale.map(d => ({...d, id: newBlock.id}));
    await db.block_content.bulkCreate(newBlockContent).catch(catcher);
    const newInputs = newRow.inputs.map(d => ({...stripID(d), block_id: newRow.id}));
    await db.block_input.bulkCreate(newInputs);
  }
  return newSection.id;
};

const pruneSearch = async(cubeName, dimension, levels, db) => {
  const currentMeta = await db.profile_meta.findAll().catch(catcher);
  const dimensionCubePairs = currentMeta.reduce((acc, d) => acc.concat(`${d.dimension}-${d.cubeName}`), []);

  /**
   * Only clear the search table of dimensions that NO remaining profiles are currently making use of.
   * Don't need to prune levels - they will be filtered automatically in searches.
   * If it gets unwieldy in size however, an optimization could be made here
   */
  if (!dimensionCubePairs.includes(`${dimension}-${cubeName}`)) {
    const resp = await db.search.destroy({where: {dimension, cubeName}}).catch(catcher);
    if (verbose) console.log(`Cleaned up search data. Rows affected: ${resp}`);
  }
  else {
    if (verbose) console.log(`Skipped search cleanup - ${dimension}/${cubeName} is still in use`);
  }
};

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/cms", (req, res) => res.json(cmsCheck()));
  app.get("/api/cms/minRole", (req, res) => res.json(cmsMinRole()));

  /**
   * ref: the table being maxed, like "block"
   * accessor: a string like "section_id"
   * id: the id of the parent
   */
  const findMaxOrdering = async(ref, accessor, id) => {
    const where = {
      attributes: [[sequelize.fn("max", sequelize.col("ordering")), "max"]],
      raw: true
    };
    if (accessor && id) where.where = {[accessor]: id};
    const maxFetch = await db[ref].findAll(where).catch(catcher);
    const ordering = typeof maxFetch[0].max === "number" ? maxFetch[0].max + 1 : 0;
    return ordering;
  };

  const cleanSection = section => {
    section = sortSection(db, section);
    section.types = Object.values(SECTION_TYPES);
    return section;
  };

  /* BASIC GETS */

  // Top-level tables have their own special gets, so exclude them from the "simple" gets
  const getList = cmsTables.filter(tableName =>
    !["profile", "section", "story", "storysection"].includes(tableName)
  );

  getList.forEach(ref => {
    app.get(`/api/cms/${ref}/get/:id`, async(req, res) => {
      if (contentTables.includes(ref)) {
        const u = await db[ref].findOne({where: {id: req.params.id}, include: {association: "contentByLocale"}}).catch(catcher);
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
      profile.sections = profile.sections.map(section => cleanSection(section));
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
        {association: "contentByLocale", separate: true}
      ]
    }).catch(catcher);
    meta = meta.map(m => m.toJSON());
    const locale = req.query.locale ? req.query.locale : defaultLocale;
    meta.forEach(m => {
      if (m.contentByLocale instanceof Array) {
        m.contentByLocale = m.contentByLocale.find(c => c.locale === locale) ||
          m.contentByLocale.find(c => c.locale === defaultLocale) ||
           m[0];
      }
    });
    res.json(meta);
  });

  app.get("/api/cms/formatter", async(req, res) => {
    const formatters = await db.formatter.findAll().catch(catcher);
    res.json(formatters);
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
        req.body.ordering = await findMaxOrdering(ref, parentOrderingTables[ref], req.body[parentOrderingTables[ref]]).catch(catcher);
      }
      // First, create the metadata object in the top-level table
      const newObj = await db[ref].create(req.body).catch(catcher);
      // For a certain subset of translated tables, we need to also insert a new, corresponding english content row.
      if (contentTables.includes(ref)) {
        const payload = Object.assign({}, req.body, {id: newObj.id, locale: defaultLocale});
        await db[`${ref}_content`].create(payload).catch(catcher);
        let reqObj;
        if (ref === "section") {
          reqObj = Object.assign({}, sectionReqFull, {where: {id: newObj.id}});
        }
        else if (ref === "block") {
          reqObj = {where: {id: newObj.id}, include: [{association: "contentByLocale"}, {association: "inputs"}]};
        }
        else {
          reqObj = {where: {id: newObj.id}, include: {association: "contentByLocale"}};
        }
        let fullObj = await db[ref].findOne(reqObj).catch(catcher);
        fullObj = fullObj.toJSON();
        fullObj.contentByLocale = fullObj.contentByLocale.reduce(contentReducer, {});
        if (ref === "section") {
          fullObj.types = Object.values(SECTION_TYPES);
        }
        return res.json(fullObj);
      }
      else {
        // If a new block_input was created, a block (block_id) subscribed to another block (input_id) as an input.
        // The requesting block needs its "inputs" array to be correct, so instead of returning the block_input relation,
        // return a full copy of the block that made the request - complete with full list of inputs.
        if (ref === "block_input") {
          let block = await db.block.findOne({where: {id: req.body.block_id}, include: [{association: "contentByLocale"}, {association: "inputs"}]}).catch(catcher);
          block = block.toJSON();
          block.contentByLocale = block.contentByLocale.reduce(contentReducer, {});
          return res.json(block);
        }
        else {
          return res.json(newObj);
        }
      }
    });
  });

  /* CUSTOM INSERTS */
  app.post("/api/cms/profile/newScaffold", isEnabled, async(req, res) => {
    const ordering = await findMaxOrdering("profile").catch(catcher);
    const profileFields = Object.values(PROFILE_FIELDS).reduce((acc, d) => req.body[d] ? {...acc, [d]: req.body[d]} : acc, {});
    const profile = await db.profile.create({ordering}).catch(catcher);
    await db.profile_content.create({id: profile.id, locale: defaultLocale, content: profileFields}).catch(catcher);
    const section = await db.section.create({ordering: 0, type: SECTION_TYPES.HERO, profile_id: profile.id});
    await db.section_content.create({id: section.id, locale: defaultLocale}).catch(catcher);
    const reqObj = Object.assign({}, profileReqFull, {where: {id: profile.id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => cleanSection(section));
    return res.json(newProfile);
  });

  app.post("/api/cms/profile/upsertDimension", isEnabled, async(req, res) => {
    req.setTimeout(1000 * 60 * 5);
    const {profileData, includeAllMembers} = req.body;
    const {profile_id} = profileData;  // eslint-disable-line
    profileData.dimension = profileData.dimName;
    const oldmeta = await db.profile_meta.findOne({where: {id: profileData.id}}).catch(catcher);
    // Inserts are simple
    if (!oldmeta) {
      // If no ordering was provided, divine ordering from meta length.
      if (isNaN(profileData.ordering)) {
        const ordering = await findMaxOrdering("profile_meta", "profile_id", profile_id);
        profileData.ordering = ordering;
      }
      await db.profile_meta.create(profileData);
      await populateSearch(profileData, db, false, false, includeAllMembers);
    }
    // Updates are more complex - the user may have changed levels, or even modified the dimension
    // entirely. We have to prune the search before repopulating it.
    else {
      await db.profile_meta.update(profileData, {where: {id: profileData.id}});
      if (oldmeta.cubeName !== profileData.cubeName || oldmeta.dimension !== profileData.dimension || oldmeta.levels.join() !== profileData.levels.join()) {
        pruneSearch(oldmeta.cubeName, oldmeta.dimension, oldmeta.levels, db);
        await populateSearch(profileData, db, false, false, includeAllMembers);
      }
    }
    const reqObj = Object.assign({}, profileReqFull, {where: {id: profile_id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => cleanSection(section));
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
      // When ordering is provided, this update is the result of a drag/drop reordering.
      // Insert the item in the desired spot, bump all other orderings to match, and
      // importantly, prepare a "siblings" lookup of the new orderings to apply in the reducer,
      // so the whole array knows can have its ordering updated on the front end.
      let siblings;
      if (req.body.ordering) {
        const entity = await db[ref].findOne({where: {id}}).catch(catcher);
        let items = await db[ref].findAll({where: {[parentOrderingTables[ref]]: entity[parentOrderingTables[ref]]}}).catch(catcher);
        items = items.sort(sorter).map(d => d.id).filter(d => d !== id);
        items.splice(req.body.ordering, 0, id);
        items = items.map((d, i) => ({id: d, ordering: i}));
        siblings = items.reduce((acc, d) => ({...acc, [d.id]: d.ordering}), {});
        // todo1.0 this loop sucks. upgrade to sequelize 5 for updateOnDuplicate support.
        for (const item of items) {
          await db[ref].update({ordering: item.ordering}, {where: {id: item.id}}).catch(catcher);
        }
      }
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
          const entity = await db[ref].findOne({where: {id}, include: {association: "contentByLocale"}}).catch(catcher);
          entity.contentByLocale = entity.contentByLocale.reduce(contentReducer, {});
          return res.json({entity, siblings});
        }
        else {
          const entity = await db[ref].findOne({where: {id}}).catch(catcher);
          return res.json(entity, siblings);
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
    {elements: ["block"], parent: "section_id"}
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
    {ref: "section", parent: "profile_id"}
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

  app.post("/api/cms/block_input/swap", isEnabled, async(req, res) => {
    const {id} = req.body;
    const original = await db.block_input.findOne({where: {id}}).catch(catcher);
    const otherWhere = {ordering: original.ordering + 1, block_id: original.block_id};
    const other = await db.block_input.findOne({where: otherWhere}).catch(catcher);
    await db.block_input.update({ordering: sequelize.literal("ordering + 1")}, {where: {id}}).catch(catcher);
    await db.block_input.update({ordering: sequelize.literal("ordering - 1")}, {where: {id: other.id}}).catch(catcher);
    const reqObj = {where: {id: original.block_id}, include: [{association: "inputs"}]};
    let block = await db.block.findOne(reqObj).catch(catcher);
    let rows = [];
    if (block) {
      block = block.toJSON();
      block.inputs = bubbleSortInputs(db.block_input, block.inputs);
      rows = block.inputs;
    }
    return res.json({parent_id: original.block_id, inputs: rows});
  });

  /* DUPLICATES */

  app.post("/api/cms/section/duplicate", isEnabled, async(req, res) => {
    const {id, pid} = req.body;
    const reqObj = {...sectionReqFull, where: {id}};
    let oldSection = await db.section.findOne(reqObj).catch(catcher);
    oldSection = oldSection.toJSON();
    if (pid === oldSection.profile_id) {
      // Because this is the same profile, we want its ordering to be after the duplication source.
      // Slide up all of the other sections to make room
      await db.section.update({ordering: sequelize.literal("ordering +1")}, {where: {profile_id: pid, ordering: {[Op.gt]: oldSection.ordering}}}).catch(catcher);
      // Then override the ordering of oldSection to be after the source one (i.e., one higher)
      oldSection.ordering++;
    }
    else {
      // If this section is being added to a different profile, override its ordering to be the last in the list.
      const ordering = await findMaxOrdering("section", "profile_id", pid);
      oldSection.ordering = ordering;
    }
    const newSectionId = await duplicateSection(db, oldSection, pid);
    const newReqObj = Object.assign({}, sectionReqFull, {where: {id: newSectionId}});
    let newSection = await db.section.findOne(newReqObj).catch(catcher);
    newSection = cleanSection(newSection.toJSON());
    return res.json(newSection);
  });

  app.post("/api/cms/profile/duplicate", isEnabled, async(req, res) => {
    // Fetch the full tree for the provided ID
    const reqObj = Object.assign({}, profileReqFull, {where: {id: req.body.id}});
    let oldProfile = await db.profile.findOne(reqObj).catch(catcher);
    oldProfile = oldProfile.toJSON();
    // Make a new Profile
    const ordering = await findMaxOrdering("profile");
    const newProfile = await db.profile.create({ordering}).catch(catcher);
    // Clone meta with new slugs
    const newMeta = oldProfile.meta.map(d => Object.assign({}, stripID(d), {profile_id: newProfile.id, slug: `${d.slug}-${newProfile.id}`}));
    await db.profile_meta.bulkCreate(newMeta).catch(catcher);
    // Clone language content with new id
    const newProfileContent = oldProfile.contentByLocale.map(d => Object.assign({}, d, {id: newProfile.id}));
    await db.profile_content.bulkCreate(newProfileContent).catch(catcher);
    // Clone Sections
    for (const oldSection of oldProfile.sections) {
      await duplicateSection(db, oldSection, newProfile.id);
    }
    // Now that all the creations are complete, fetch a new hierarchical and sorted profile.
    const finalReqObj = {...profileReqFull, where: {id: newProfile.id}};
    let finalProfile = await db.profile.findOne(finalReqObj).catch(catcher);
    finalProfile = sortProfile(db, finalProfile.toJSON());
    finalProfile.sections = finalProfile.sections.map(section => cleanSection(section));
    return res.json(finalProfile);
  });

  /*

  // todo1.0
  const duplicateList = ["block"];

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

  */

  /* TRANSLATIONS */
  /** Translations are provided by the Google API and require an authentication key. They are requested client-side for
   * card-by-card translations (allowing for in-place editing) but can be batch-translated here.
   */
  app.post("/api/cms/section/translate", async(req, res) => {
    const sid = req.body.id;
    const {variables, source, target} = req.body;
    const reqObj = {...sectionReqFull, where: {id: sid}};
    let section = await db.section.findOne(reqObj);
    section = section.toJSON();
    const helpers = await fetchUpsertHelpers(db, section.profile_id, source);
    const {formatterFunctions, allSelectors} = helpers;
    // todo1.0 selector refactor
    const config = {variables, source, target, formatterFunctions, allSelectors};
    const error = await translateSection(db, section, config);
    if (error) return res.json({error});
    // If there were no errors, fetch and return updated section
    const newReqObj = {...sectionReqFull, where: {id: sid}};
    let newSection = await db.section.findOne(newReqObj).catch(catcher);
    newSection = cleanSection(newSection);
    return res.json(newSection);
  });

  app.post("/api/cms/profile/translate", async(req, res) => {
    const pid = req.body.id;
    const {variables, source, target} = req.body;
    const config = {variables, source, target};
    const error = await translateProfile(db, pid, config);
    if (error) return res.json({error});
    // If there were no errors, fetch and return updated profile
    const reqObj = {...profileReqFull, where: {id: pid}};
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => cleanSection(section));
    return res.json(newProfile);
  });

  /* DELETES */

  app.delete("/api/cms/block/delete", isEnabled, async(req, res) => {
    const row = await db.block.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.block.update(
      {ordering: sequelize.literal("ordering -1")},
      {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}}
    ).catch(catcher);
    await db.block.destroy({where: {id: req.query.id}}).catch(catcher);
    const reqObj = {
      where: {section_id: row.section_id},
      order: [["ordering", "ASC"]],
      include: [{association: "contentByLocale"}, {association: "inputs"}]
    };
    const rows = await db.block.findAll(reqObj).catch(catcher);
    rows.forEach(row => row.contentByLocale = row.contentByLocale.reduce(contentReducer, {}));
    return res.json({parent_id: row.section_id, newArray: rows});
  });

  app.delete("/api/cms/block_input/delete", isEnabled, async(req, res) => {
    const {id} = req.query; // eslint-disable-line camelcase
    const row = await db.block_input.findOne({where: {id}}).catch(catcher);
    // await db.block_input.update({ordering: sequelize.literal("ordering -1")}, {where: {block_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.block_input.destroy({where: {id}});
    const reqObj = {where: {id: row.block_id}, include: [{association: "inputs"}]};
    let block = await db.block.findOne(reqObj).catch(catcher);
    let inputs = [];
    if (block) {
      block = block.toJSON();
      // block.inputs = bubbleSortInputs(db.block_input, block.inputs);
      inputs = block.inputs;
    }
    return res.json({parent_id: row.block_id, inputs});
  });

  app.delete("/api/cms/profile/delete", isEnabled, async(req, res) => {
    const row = await db.profile.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.profile.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.profile.destroy({where: {id: req.query.id}}).catch(catcher);
    // Todo: This prunesearch is outdated - need to call it multiple times for each meta row.
    // pruneSearch(row.dimension, row.levels, db);
    let profiles = await db.profile.findAll(profileReqFull).catch(catcher);
    profiles = sortProfileTree(db, profiles);
    profiles.forEach(profile => {
      profile.sections = profile.sections.map(section => cleanSection(section));
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
      await db.profile_meta.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    }
    await db.profile_meta.destroy({where: {id: req.query.id}}).catch(catcher);
    pruneSearch(row.cubeName, row.dimension, row.levels, db);
    const reqObj = Object.assign({}, profileReqFull, {where: {id: row.profile_id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => cleanSection(section));
    return res.json(newProfile);
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

    /*
    const reqObj = Object.assign({}, sectionReqFull, {where: {profile_id: row.profile_id}, order: [["ordering", "ASC"]]});
    let sections = await db.section.findAll(reqObj).catch(catcher);
    sections = sections.map(section => {
      section = section.toJSON();
      section = sortSection(db, section);
      section.types = Object.values(SECTION_TYPES);
      return section;
    });
    return res.json({id: row.id, parent_id: row.profile_id, sections});*/
    let profiles = await db.profile.findAll(profileReqFull).catch(catcher);
    profiles = sortProfileTree(db, profiles);
    profiles.forEach(profile => {
      profile.sections = profile.sections.map(section => cleanSection(section));
      return profile;
    });
    return res.json({profiles});
  });

};
