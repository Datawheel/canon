const Client = require("@datawheel/olap-client").Client;
const MondrianDataSource = require("@datawheel/olap-client").MondrianDataSource;
const jwt = require("jsonwebtoken");

const d3Array = require("d3-array");
const yn = require("yn");
const {strip} = require("d3plus-text");
const stripHTML = require("./formatters/stripHTML");

const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";
const verbose = yn(process.env.CANON_CMS_LOGGING);
const LANGUAGES = process.env.CANON_LANGUAGES ? process.env.CANON_LANGUAGES.split(",") : [envLoc];
if (!LANGUAGES.includes(envLoc)) LANGUAGES.push(envLoc);
// Put the default language first in the array. This ensures that slugs that are generated
// in populateSearch will be made from the default language content.
LANGUAGES.sort(a => a === envLoc ? -1 : 1);

const {OLAP_PROXY_SECRET, CANON_CMS_MINIMUM_ROLE} = process.env;
const CANON_CMS_CUBES = process.env.CANON_CMS_CUBES || "localhost";

let client;

const getClient = async() => {

  /**
 * There is not a fully-featured way for olap-client to know the difference between a
 * Tesseract and a Mondrian Client. Tesseract is more modern/nice in its HTTP codes/responses,
 * so attempt Tesseract first, and on failure, assume mondrian.
 */
  client = new Client();

  const config = {url: CANON_CMS_CUBES};
  if (OLAP_PROXY_SECRET) {
    const jwtPayload = {sub: "server", status: "valid"};
    if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
    const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
    config.headers = {"x-tesseract-jwt-token": apiToken};
  }

  const datasource = await Client.dataSourceFromURL(config).catch(err => {
    if (verbose) console.error(`Tesseract not detected: ${err.message}`);
    return false;
  });
  if (datasource) {
    if (verbose) console.log(`Initializing Tesseract at ${CANON_CMS_CUBES}`);
    client.setDataSource(datasource);
  }
  else {
    if (verbose) console.log(`Initializing Mondrian at ${CANON_CMS_CUBES}`);
    const ds = new MondrianDataSource(config);
    client.setDataSource(ds);
  }
};

const catcher = e => {
  if (verbose) {
    console.error("Error in populateSearch: ", e.message);
  }
  return [];
};

const isObject = d => !Array.isArray(d) && typeof d === "object";
const fixObjForPostgres = d => {
  if (d !== 0 && !d) {
    return "NULL";
  }
  if (isObject(d)) {
    return `'${JSON.stringify(d)}'`;
  }
  else if (Array.isArray(d)) {
    return `ARRAY[${d.map(o => `'${o}'`).join(",")}]`;
  }
  else {
    return `\'${`${d}`.replace(/\'/g, "''")}\'`;
  }
};

const formatter = (members, data, dimension, level) => {

  const newData = members.reduce((arr, d) => {
    const obj = {};
    obj.id = `${d.key}`;
    obj.name = d.caption || d.name;
    obj.zvalue = data[obj.id] || 0;
    obj.dimension = dimension;
    obj.hierarchy = level;
    arr.push(obj);
    return arr;
  }, []);
  const st = d3Array.deviation(newData, d => d.zvalue);
  const average = d3Array.median(newData, d => d.zvalue);
  newData.forEach(d => d.zvalue = (d.zvalue - average) / st);
  // Normalize z-values
  const max = d3Array.max(newData, d => d.zvalue);
  const min = d3Array.min(newData, d => d.zvalue);
  newData.forEach(d => d.zvalue = (d.zvalue - min) / (max - min));
  return newData;
};

const populateSearch = async(profileData, db, metaLookup = false, newSlugs = false, includeAllMembers = false) => {

  if (!client) await getClient();

  const dbQuery = db.search.sequelize.query.bind(db.search.sequelize);

  const cubeName = profileData.cubeName;
  const measure = profileData.measure;
  const dimension = profileData.dimName || profileData.dimension;
  const dimLevels = profileData.levels;

  const cube = await client.getCube(cubeName).catch(err => {
    console.error(`Error while retrieving cube ${cubeName}:`, err);
    throw err;
  });

  const levels = [];

  if (verbose) console.log(`INITIATING SEARCH INGEST (${dimension}, ${dimLevels}, ${measure}, ${cubeName})...`);

  for (const hierarchy of cube.dimensionsByName[dimension].hierarchies) {
    for (const level of hierarchy.levels) {
      if (!levels.map(d => d.name).includes(level.name) && level.name !== "(All)" && dimLevels.includes(level.name)) levels.push(level);
    }
  }

  for (const locale of LANGUAGES) {

    if (verbose) console.log(`Starting ingest for locale: ${locale}...`);

    let fullList = [];

    for (let i = 0; i < levels.length; i++) {

      const level = levels[i];
      let members = await client.getMembers(level, {locale}).catch(catcher);

      let data = [];

      const drilldown = {
        dimension,
        hierarchy: level.hierarchy.name,
        level: level.name
      };

      data = await client.execQuery(cube.query
        .addDrilldown(drilldown)
        .addMeasure(measure))
        .then(resp => resp.data)
        .then(data => data.reduce((obj, d) => {
          obj[d[`ID ${level.name}`] ? d[`ID ${level.name}`] : d[`${level.name} ID`]] = d[measure];
          return obj;
        }, {})).catch(catcher);

      /**
       * The default behavior here is to filter down the members list to those with values for the chosen measure.
       * However, if the user has specified to include all members, don't perform this filter. This will result in
       * members in the search database that do not have values for the chosen measure, BUT may have values for other measures,
       * in other cubes. This is sometimes used for shared dimensions.
       */
      if (!includeAllMembers) members = members.filter(d => data[d.key] !== undefined);

      fullList = fullList.concat(formatter(members, data, dimension, level.name)).filter(d => d.id);

    }

    if (verbose) console.log(`Fetched ${fullList.length} members from cube: ${cubeName}.`);

    if (fullList.length > 0) {

      const slugs = await db.search.findAll().catch(catcher);
      const usedSlugs = {};
      slugs.forEach(s => {
        // If slugs are to be generated from scratch ("newSlugs"), do not include any slugs from this dim/level set as "used". This prevents
        // them from crashing into each other and adding ids on the end.
        const exclude = newSlugs && s.cubeName === cubeName && s.dimension === dimension && dimLevels.includes(s.hierarchy);
        if (!exclude && s.slug) usedSlugs[s.slug] = true;
      });

      const meta = await db.profile_meta.findAll().catch(catcher);
      const cubeHash = meta.reduce((acc, d) => ({...acc, [d.cubeName]: d.id}), {});

      const slugify = str => strip(stripHTML(str)).replace(/-{2,}/g, "-").toLowerCase();

      if (verbose) console.log("Generating slugs...");
      // Add a generated slug and the originating cubeName to the write payload
      const searchList = fullList.map(d => {
        const member = {slug: slugify(d.name), cubeName, ...d};
        // If metaLookup was provided, this is a migration. Attempt to bring image from an old db
        if (metaLookup && metaLookup[`${d.id}-${d.dimension}-${d.hierarchy}`]) {
          member.imageId = metaLookup[`${d.id}-${d.dimension}-${d.hierarchy}`].imageId;
        }
        return member;
      });
      if (verbose) console.log("Deduping slugs...");
      searchList.forEach(member => {
        // A slug may not be unique across all cubes, so use its id for disambiguation
        if (usedSlugs[member.slug]) member.slug += `-${member.id}`;
        // Further, in some edge cases (usually when a cube is split into multiples), even
        // the id may not be enough, so use a cube-id to disambiguate.
        if (usedSlugs[member.slug]) member.slug += `-${cubeHash[member.cubeName]}`;
        usedSlugs[member.slug] = true;
      });
      if (verbose) console.log("Slug generation complete.");

      const searchInsertKeys = Object.keys(searchList[0]).filter(d => d !== "name");
      // If metaLookup was provided, this is a migration. Make sure the insert SQL processes the insert
      if (metaLookup && !searchInsertKeys.includes("imageId")) searchInsertKeys.push("imageId");
      let searchUpdateKeys = searchInsertKeys;
      // On conflict (update), do not attempt to change the slug, unless the user has specified to override.
      if (!newSlugs) {
        searchUpdateKeys = searchInsertKeys.filter(d => d !== "slug");
      }

      const dedupeSearch = [];
      const dupes = [];

      searchList.forEach(d => {
        if (!dedupeSearch.find(o => o.id === d.id)) {
          dedupeSearch.push(d);
        }
        else {
          dupes.push(d);
        }
      });

      if (dedupeSearch.length !== searchList.length && verbose) {
        console.log(`Warning - Duplicate IDs in Tesseract: ${dupes.map(d => d.id)}`);
      }

      let searchQuery = `INSERT INTO canon_cms_search (${searchInsertKeys.map(d => `"${d}"`).join(", ")})\nVALUES `;
      dedupeSearch.forEach((obj, i) => {
        searchQuery += `${i ? "," : ""}\n(${searchInsertKeys.map(key => fixObjForPostgres(obj[key]))})`;
      });
      searchQuery += `\nON CONFLICT ("id", "dimension", "hierarchy", "cubeName")\nDO UPDATE SET (${searchUpdateKeys.map(d => `"${d}"`).join(", ")}) = (${searchUpdateKeys.map(key => `EXCLUDED."${key}"`).join(", ")})\nRETURNING *;`;

      if (verbose) console.log("Upserting search table...");
      // Capture the newly inserted rows for use later, their new contentIds will be needed to hook up language content
      const [searchRows] = await dbQuery(searchQuery).catch(catcher);
      if (verbose) console.log(`Upserted ${searchRows.length} rows.`);

      // Iterate over the members from the cube and store them in a hash keyed by id/dim/hier
      const searchLookup = dedupeSearch.reduce((obj, d) => {
        obj[`${d.id}-${d.dimension}-${d.hierarchy}`] = d;
        return obj;
      }, {});

      // We now need to COMBINE the name from the cube (searchLookup) and the newly generated contentId from the
      // new inserts (searchRows) so that the language content matches up with the proper row.
      const contentList = searchRows.map(member => {
        const original = searchLookup[`${member.id}-${member.dimension}-${member.hierarchy}`];
        let obj = {name: original.name, id: member.contentId, locale};
        // If metaLookup was provided, this is a migration. There may be keywords/attr to migrate.
        if (metaLookup) {
          const oldmeta = metaLookup[`${member.id}-${member.dimension}-${member.hierarchy}`];
          if (oldmeta) {
            const {content} = oldmeta;
            if (content) {
              const loc = content.find(c => c.locale === locale);
              if (loc) {
                obj = {...obj, attr: loc.attr, keywords: loc.keywords};
              }
            }
          }
        }
        return obj;
      });

      const contentKeys = ["id", "locale", "name"];
      // If metaLookup was provided, this is a migration. Make sure the insert SQL processes the attr/keywords insert
      if (metaLookup) {
        if (!contentKeys.includes("attr")) contentKeys.push("attr");
        if (!contentKeys.includes("keywords")) contentKeys.push("keywords");
      }

      let contentQuery = `INSERT INTO canon_cms_search_content (${contentKeys.join(", ")})\nVALUES `;
      contentList.forEach((obj, i) => {
        contentQuery += `${i ? "," : ""}\n(${contentKeys.map(key => fixObjForPostgres(obj[key]))})`;
      });
      contentQuery += `\nON CONFLICT (id, locale)\nDO UPDATE SET (${contentKeys.join(", ")}) = (${contentKeys.map(key => `EXCLUDED.${key}`).join(", ")})\nRETURNING *;`;

      if (verbose) console.log(`Upserting content table for ${locale}...`);
      const [contentRows] = await dbQuery(contentQuery).catch(catcher);
      if (verbose) console.log(`Upserted ${contentRows.length} content rows for locale: ${locale}.`);
    }
  }
  if (verbose) console.log("SEARCH INGEST COMPLETE");
};

module.exports = populateSearch;
