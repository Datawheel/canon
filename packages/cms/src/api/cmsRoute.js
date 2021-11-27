const sequelize = require("sequelize"),
      Op = sequelize.Op, // eslint-disable-line
      yn = require("yn");

const populateSearch = require("../utils/populateSearch");
const {profileReqFull, sectionReqFull, cmsTables, contentTables, parentOrderingTables, blockReqFull} = require("../utils/sequelize/ormHelpers");
const {translateProfile, translateSection, fetchUpsertHelpers} = require("../utils/translation/translationUtils");
const {PROFILE_FIELDS} = require("../utils/consts/cms");
const {REQUEST_STATUS} = require("../utils/consts/redux");
const {runConsumers} = require("../utils/sequelize/blockHelpers");

const localeDefault = process.env.CANON_LANGUAGE_DEFAULT || "en";
const verbose = yn(process.env.CANON_CMS_LOGGING);

const cmsCheck = () => process.env.NODE_ENV === "development" || yn(process.env.CANON_CMS_ENABLE);
const cmsMinRole = () => process.env.CANON_CMS_MINIMUM_ROLE ? Number(process.env.CANON_CMS_MINIMUM_ROLE) : 1;

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

const contentReducer = (acc, d) => ({...acc, [d.locale]: d});

const sortProfile = (db, profile) => {
  // Don't use flatSort for meta. Meta can have multiple entities in the same ordering, so do not attempt to "flatten" them out
  profile.meta = profile.meta.sort(sorter);
  profile.contentByLocale = profile.contentByLocale.reduce(contentReducer, {});
  profile.sections = flatSort(db.section, profile.sections);
  return profile;
};

const sortSection = (db, section) => {
  section.contentByLocale = section.contentByLocale.reduce(contentReducer, {});
  section.blocks.forEach(block => block.contentByLocale = block.contentByLocale.reduce(contentReducer, {}));
  // todo1.0
  // ordering is nested in section_selector - bubble for top-level sorting
  // section.selectors = bubbleSortSelectors(db.section_selector, section.selectors);
  return section;
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

  /* ACTIVATION */

  const activate = async(req, sid, bid) => {
    const locale = req.query.locale ? req.query.locale : localeDefault;
    let blocks = await db.block.findAll({...blockReqFull, where: {section_id: sid}}).catch(catcher);
    if (!blocks) return {status: REQUEST_STATUS.ERROR};
    blocks = blocks.map(d => {
      d = d.toJSON();
      // runConsumers requires a normalized block shape. This emulates that.
      // todo1.0, either normalize this or create a different way of using runConsumers
      return {...d,
        contentByLocale: d.contentByLocale.reduce(contentReducer, {}),
        inputs: d.inputs.map(d => d.id),
        consumers: d.consumers.map(d => d.id)
      };
    }).reduce((acc, d) => ({...acc, [d.id]: d}), {});
    // todo1.0 fix formatter usage here, add error logging
    const args = [req, blocks, locale, {}];
    if (bid) args.push({[bid]: blocks[bid]});
    return await runConsumers(...args);
  };

  app.get("/api/cms/block/activate", async(req, res) => {
    const {id} = req.query;
    const block = await db.block.findOne({where: {id}}).catch(catcher);
    if (!block) return res.json({status: REQUEST_STATUS.ERROR});
    const activateResult = await activate(req, block.section_id, block.id);
    return res.json(activateResult);
  });

  app.get("/api/cms/section/activate", async(req, res) => {
    const id = Number(req.query.id);
    const profiles = await getProfileTreeAndActivate(req, id);
    return res.json(profiles);
  });

  /* GETS */

  app.get("/api/cms/meta", async(req, res) => {
    let meta = await db.profile_meta.findAll().catch(catcher);
    meta = meta.map(m => m.toJSON());
    for (const m of meta) {
      m.top = await db.search.findOne({where: {dimension: m.dimension, cubeName: m.cubeName}, order: [["zvalue", "DESC"]], limit: 1}).catch(catcher);
    }
    res.json(meta);
  });

  app.get("/api/cms/tree", async(req, res) => res.json(await getProfileTreeAndActivate(req)));

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
    const locale = req.query.locale ? req.query.locale : localeDefault;
    meta.forEach(m => {
      if (m.contentByLocale instanceof Array) {
        m.contentByLocale = m.contentByLocale.find(c => c.locale === locale) ||
          m.contentByLocale.find(c => c.locale === localeDefault) ||
           m[0];
      }
    });
    res.json(meta);
  });

  app.get("/api/cms/formatter", async(req, res) => {
    const formatters = await db.formatter.findAll().catch(catcher);
    res.json(formatters);
  });

  /* INSERTS */

  app.post("/api/cms/profile/new", isEnabled, async(req, res) => {
    const ordering = await findMaxOrdering("profile").catch(catcher);
    const profileFields = Object.values(PROFILE_FIELDS).reduce((acc, d) => req.body[d] ? {...acc, [d]: req.body[d]} : acc, {});
    const profile = await db.profile.create({ordering}).catch(catcher);
    await db.profile_content.create({id: profile.id, locale: localeDefault, content: profileFields}).catch(catcher);
    const section = await db.section.create({ordering: 0, slug: "hero", profile_id: profile.id});
    await db.section_content.create({id: section.id, locale: localeDefault}).catch(catcher);
    const profiles = await getProfileTreeAndActivate(req).catch(catcher);
    return res.json(profiles);
  });

  app.post("/api/cms/section/new", isEnabled, async(req, res) => {
    // If the order was provided, we need to bump all siblings up to make room.
    if (req.body.ordering) {
      await db.section.update(
        {ordering: sequelize.literal("ordering +1")},
        {where: {ordering: {[Op.gte]: req.body.ordering}, profile_id: req.body.profile_id}}).catch(catcher);
    }
    else {
      // If it was not provided, but this is a table that needs them, append it to the end and
      // insert the derived ordering into req.body
      req.body.ordering = await findMaxOrdering("section", "profile_id", req.body.profile_id).catch(catcher);
    }
    const newSection = await db.section.create(req.body).catch(catcher);
    await db.section_content.create({...req.body, id: newSection.id, locale: localeDefault}).catch(catcher);
    const profiles = await getProfileTreeAndActivate(req, newSection.id).catch(catcher);
    return res.json(profiles);
  });

  app.post("/api/cms/block_input/new", isEnabled, async(req, res) => {
    await db.block_input.create(req.body).catch(catcher);
    const block = await db.block.findOne({where: {id: req.body.block_id}}).catch(catcher);
    const profiles = await getProfileTreeAndActivate(req, block.section_id);
    return res.json(profiles);
  });

  app.post("/api/cms/block/new", isEnabled, async(req, res) => {
    // If the blockrow was provided, we need to bump all siblings up to make room.
    const siblings = {blockcol: req.body.blockcol, section_id: req.body.section_id};
    if (req.body.blockrow) {
      await db.block.update({blockrow: sequelize.literal("blockrow +1")}, {where: {blockrow: {[Op.gte]: req.body.blockrow}, ...siblings}}).catch(catcher);
    }
    else {
      // If it was not provided, but this is a table that needs them, append it to the end and
      // insert the derived ordering into req.body
      const blocks = await db.block.findAll({where: siblings}).catch(catcher);
      req.body.blockrow = blocks.length > 0 ? blocks.sort((a, b) => a.blockrow - b.blockrow)[blocks.length - 1].blockrow + 1 : 0;
    }
    const newBlock = await db.block.create(req.body).catch(catcher);
    await db.block_content.create({...req.body, id: newBlock.id, locale: localeDefault}).catch(catcher);
    const profiles = await getProfileTreeAndActivate(req, newBlock.section_id).catch(catcher);
    return res.json(profiles);
  });

  /* CUSTOM INSERTS */

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
    newProfile.sections = newProfile.sections.map(section => sortSection(db, section));
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

  /* UPDATES */
  const updateList = cmsTables.filter(d => d !== "block");
  updateList.forEach(ref => {
    app.post(`/api/cms/${ref}/update`, isEnabled, async(req, res) => {
      const {id} = req.body;
      // When ordering is provided, this update is the result of a drag/drop reordering.
      // Insert the item in the desired spot, bump all other orderings to match
      if (req.body.ordering !== undefined) {
        const entity = await db[ref].findOne({where: {id}}).catch(catcher);
        let items = await db[ref].findAll({where: {[parentOrderingTables[ref]]: entity[parentOrderingTables[ref]]}}).catch(catcher);
        items = items.sort(sorter).map(d => d.id).filter(d => d !== id);
        items.splice(req.body.ordering, 0, id);
        items = items.map((d, i) => ({id: d, ordering: i}));
        // todo1.0 this loop sucks. upgrade to sequelize 5 for updateOnDuplicate support.
        for (const item of items) {
          await db[ref].update({ordering: item.ordering}, {where: {id: item.id}}).catch(catcher);
        }
      }
      if (req.body.blockrow !== undefined) {
        const block = await db.block.findOne({where: {id}}).catch(catcher);
        let blocks = await db.block.findAll({where: {section_id: block.section_id, blockcol: req.body.blockcol}}).catch(catcher);
        blocks = blocks.map(d => d.toJSON()).sort((a, b) => a.blockrow - b.blockrow).map(d => d.id).filter(d => d !== id);
        blocks.splice(req.body.blockrow, 0, id);
        blocks = blocks.map((d, i) => ({id: d, blockrow: i}));
        // todo1.0 this loop sucks. upgrade to sequelize 5 for updateOnDuplicate support.
        for (const block of blocks) {
          await db.block.update({blockrow: block.blockrow}, {where: {id: block.id}}).catch(catcher);
        }
        delete req.body.blockrow;
        // If the last block of its column has been moved, all higher columns must be bumped down
        const siblings = await db.block.findAll({where: {section_id: block.section_id, blockcol: block.blockcol}}).catch(catcher);
        if (siblings.length === 1 && block.blockcol !== req.body.blockcol) {
          await db.block.update({blockcol: sequelize.literal("blockcol -1")}, {where: {section_id: block.section_id, blockcol: {[Op.gt]: block.blockcol}}}).catch(catcher);
        }
      }
      await db[ref].update(req.body, {where: {id}}).catch(catcher);
      if (contentTables.includes(ref) && req.body.content) {
        for (const content of req.body.content) {
          // todo1.0. it is bad to do this get/put, but we need to merge the jsonb. can this be done at the db level?
          // await db[`${ref}_content`].upsert(content, {where: {id, locale: content.locale}}).catch(catcher);
          const contentRow = await db[`${ref}_content`].findOne({where: {id, locale: content.locale}}).catch(catcher);
          if (contentRow) {
            await db[`${ref}_content`].update({content: {...contentRow.content, ...content.content}}, {where: {id, locale: content.locale}}).catch(catcher);
          }
          else {
            await db[`${ref}_content`].create(content).catch(catcher);
          }
        }
      }
      // Formatters are a special update case - return the whole list on update (necessary for recompiling them)
      if (ref === "formatter") {
        const rows = await db.formatter.findAll().catch(catcher);
        return res.json({id, formatters: rows});
      }
      else {
        let sid;
        if (ref === "section") sid = id;
        if (ref === "block") {
          const block = await db.block.findOne({where: {id}}).catch(catcher);
          sid = block.section_id;
        }
        const profiles = await getProfileTreeAndActivate(req, sid).catch(catcher);
        return res.json(profiles);
      }
    });
  });

  app.post("/api/cms/block/update", isEnabled, async(req, res) => {
    const {id} = req.body;
    const block = await db.block.findOne({where: {id}}).catch(catcher);
    if (req.body.blockrow !== undefined) {
      let blocks = await db.block.findAll({where: {section_id: block.section_id, blockcol: req.body.blockcol}}).catch(catcher);
      blocks = blocks.map(d => d.toJSON()).sort((a, b) => a.blockrow - b.blockrow).map(d => d.id).filter(d => d !== id);
      blocks.splice(req.body.blockrow, 0, id);
      blocks = blocks.map((d, i) => ({id: d, blockrow: i}));
      // todo1.0 this loop sucks. upgrade to sequelize 5 for updateOnDuplicate support.
      for (const block of blocks) {
        await db.block.update({blockrow: block.blockrow}, {where: {id: block.id}}).catch(catcher);
      }
      delete req.body.blockrow;
      // If the last block of its column has been moved, all higher columns must be bumped down
      const siblings = await db.block.findAll({where: {section_id: block.section_id, blockcol: block.blockcol}}).catch(catcher);
      if (siblings.length === 1 && block.blockcol !== req.body.blockcol) {
        await db.block.update({blockcol: sequelize.literal("blockcol -1")}, {where: {section_id: block.section_id, blockcol: {[Op.gt]: block.blockcol}}}).catch(catcher);
      }
    }
    await db.block.update(req.body, {where: {id}}).catch(catcher);
    for (const content of Object.values(req.body.contentByLocale)) {
      // todo1.0. it is bad to do this get/put, but we need to merge the jsonb. can this be done at the db level?
      // await db[`${ref}_content`].upsert(content, {where: {id, locale: content.locale}}).catch(catcher);
      const contentRow = await db.block_content.findOne({where: {id, locale: content.locale}}).catch(catcher);
      if (contentRow) {
        await db.block_content.update({content: {...contentRow.content, ...content.content}}, {where: {id, locale: content.locale}}).catch(catcher);
      }
      else {
        await db.block_content.create(content).catch(catcher);
      }
    }
    const profiles = await getProfileTreeAndActivate(req, block.section_id).catch(catcher);
    return res.json(profiles);
  });

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
    newSection = sortSection(db, newSection);
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
    newProfile.sections = newProfile.sections.map(section => sortSection(db, section));
    return res.json(newProfile);
  });

  /* DELETES */

  const getProfileTreeAndActivate = async(req, sid) => {
    let profiles = await db.profile.findAll(profileReqFull).catch(catcher);
    profiles = profiles.map(p => p.toJSON());
    profiles = flatSort(db.profile, profiles);
    for (const profile of profiles) {
      profile.meta = profile.meta.sort(sorter);
      profile.contentByLocale = profile.contentByLocale.reduce(contentReducer, {});
      profile.sections = flatSort(db.section, profile.sections);
      for (const section of profile.sections) {
        section.contentByLocale = section.contentByLocale.reduce(contentReducer, {});
        section.blocks.forEach(block => block.contentByLocale = block.contentByLocale.reduce(contentReducer, {}));
        if (section.id === sid) {
          const {variablesById, statusById} = await activate(req, sid);
          section.blocks = section.blocks.map(d => ({...d, _variables: variablesById[d.id] || {}, _status: statusById[d.id] || {}}));
        }
      }
    }
    return profiles;
  };

  app.delete("/api/cms/block/delete", isEnabled, async(req, res) => {
    const block = await db.block.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.block.update({blockrow: sequelize.literal("blockrow -1")}, {where: {section_id: block.section_id, blockcol: block.blockcol, blockrow: {[Op.gt]: block.blockrow}}}).catch(catcher);
    const siblings = await db.block.findAll({where: {section_id: block.section_id, blockcol: block.blockcol}}).catch(catcher);
    if (siblings.length === 1) await db.block.update({blockcol: sequelize.literal("blockcol -1")}, {where: {section_id: block.section_id, blockcol: {[Op.gt]: block.blockcol}}}).catch(catcher);
    await db.block.destroy({where: {id: req.query.id}}).catch(catcher);
    // todo1.0 if profile-wide blocks disappear as part of a deletion, other sections will need to recalculate
    const profiles = await getProfileTreeAndActivate(req, block.section_id).catch(catcher);
    return res.json(profiles);
  });

  app.delete("/api/cms/block_input/delete", isEnabled, async(req, res) => {
    const {id} = req.query;
    const row = await db.block_input.findOne({where: {id}}).catch(catcher);
    // todo1.0 add this ordering back in
    // await db.block_input.update({ordering: sequelize.literal("ordering -1")}, {where: {block_id, ordering: {[Op.gt]: row.ordering}}}).catch(catcher);
    await db.block_input.destroy({where: {id}});
    const block = await db.block.findOne({where: {id: row.block_id}}).catch(catcher);
    const profiles = await getProfileTreeAndActivate(req, block.section_id).catch(catcher);
    return res.json(profiles);
  });

  app.delete("/api/cms/profile/delete", isEnabled, async(req, res) => {
    const profile = await db.profile.findOne({where: {id: req.query.id}}).catch(catcher);
    await db.profile.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: profile.ordering}}}).catch(catcher);
    await db.profile.destroy({where: {id: req.query.id}}).catch(catcher);
    // Todo: This prunesearch is outdated - need to call it multiple times for each meta row.
    // pruneSearch(row.dimension, row.levels, db);
    const profiles = await getProfileTreeAndActivate(req);
    return res.json(profiles);
  });

  app.delete("/api/cms/profile_meta/delete", isEnabled, async(req, res) => {
    const meta = await db.profile_meta.findOne({where: {id: req.query.id}}).catch(catcher);
    // Profile meta can have multiple variants now sharing the same index.
    const variants = await db.profile_meta.findAll({where: {profile_id: meta.profile_id, ordering: meta.ordering}}).catch(catcher);
    // Only "slide down" others if we are deleting the last one at this ordering.
    if (variants.length === 1) {
      await db.profile_meta.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: meta.ordering}}}).catch(catcher);
    }
    await db.profile_meta.destroy({where: {id: req.query.id}}).catch(catcher);
    pruneSearch(meta.cubeName, meta.dimension, meta.levels, db);
    const reqObj = Object.assign({}, profileReqFull, {where: {id: meta.profile_id}});
    let newProfile = await db.profile.findOne(reqObj).catch(catcher);
    newProfile = sortProfile(db, newProfile.toJSON());
    newProfile.sections = newProfile.sections.map(section => sortSection(db, section));
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
    // todo1.0 if profile-wide blocks disappear as part of a deletion, other sections will need to recalculate
    const profiles = await getProfileTreeAndActivate(req).catch(catcher);
    return res.json({profiles});
  });

};
