const PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      collate = require("../utils/collate"),
      formatters4eval = require("../utils/formatters4eval"),
      jwt = require("jsonwebtoken"),
      libs = require("../utils/libs"), /*leave this! needed for the variable functions.*/ //eslint-disable-line
      mortarEval = require("../utils/mortarEval"),
      prepareProfile = require("../utils/prepareProfile"),
      prepareStory = require("../utils/prepareStory"),
      sequelize = require("sequelize"),
      urlSwap = require("../utils/urlSwap"),
      varSwapRecursive = require("../utils/varSwapRecursive"),
      yn = require("yn");

const {
  CANON_CMS_MINIMUM_ROLE,
  CANON_CMS_FORCE_HTTPS,
  OLAP_PROXY_SECRET
} = process.env;

const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";
const forceHTTPS = yn(CANON_CMS_FORCE_HTTPS);

const catcher = e => {
  if (verbose) console.error("Error in mortarRoute: ", e);
  return [];
};

axios.interceptors.request.use(d => {
  d.meta = d.meta || {};
  d.meta.requestStartedAt = new Date().getTime();
  return d;
});

axios.interceptors.response.use(d => {
  d.requestDuration = new Date().getTime() - d.config.meta.requestStartedAt;
  return d;
}, e => Promise.reject(e));

const getConfig = (opt = {}) => {
  const config = {};
  if (OLAP_PROXY_SECRET) {
    const jwtPayload = {sub: "server", status: "valid"};
    if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
    const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
    config.headers = {"x-tesseract-jwt-token": apiToken};
  }
  return {...config, ...opt};
};

const LANGUAGE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "canon";
const LANGUAGES = process.env.CANON_LANGUAGES || LANGUAGE_DEFAULT;
const LOGINS = process.env.CANON_LOGINS || false;
const PORT = process.env.CANON_PORT || 3300;
const NODE_ENV = process.env.NODE_ENV || "development";
const REQUESTS_PER_SECOND = process.env.CANON_CMS_REQUESTS_PER_SECOND ? parseInt(process.env.CANON_CMS_REQUESTS_PER_SECOND, 10) : 20;
const GENERATOR_TIMEOUT = process.env.CANON_CMS_GENERATOR_TIMEOUT ? parseInt(process.env.CANON_CMS_GENERATOR_TIMEOUT, 10) : 5000;
let cubeRoot = process.env.CANON_CMS_CUBES || "localhost";
if (cubeRoot.substr(-1) === "/") cubeRoot = cubeRoot.substr(0, cubeRoot.length - 1);

const canonVars = {
  CANON_API: process.env.CANON_API,
  CANON_LANGUAGES: LANGUAGES,
  CANON_LANGUAGE_DEFAULT: LANGUAGE_DEFAULT,
  CANON_LOGINS: LOGINS,
  CANON_LOGLOCALE: process.env.CANON_LOGLOCALE,
  CANON_LOGREDUX: process.env.CANON_LOGREDUX,
  CANON_PORT: PORT,
  NODE_ENV
};

Object.keys(process.env).forEach(k => {
  if (k.startsWith("CANON_CONST_")) {
    canonVars[k.replace("CANON_CONST_", "")] = process.env[k];
  }
});

const throttle = new PromiseThrottle({
  requestsPerSecond: REQUESTS_PER_SECOND,
  promiseImplementation: Promise
});

const profileReq = {
  include: [
    {association: "meta", separate: true},
    {association: "content", separate: true},
    {association: "sections", separate: true,
      include: [
        {association: "content", separate: true},
        {association: "subtitles", separate: true,
          include: [{association: "content", separate: true}]
        },
        {association: "descriptions", separate: true,
          include: [{association: "content", separate: true}]
        },
        {association: "visualizations", separate: true},
        {association: "stats", separate: true,
          include: [{association: "content", separate: true}]
        },
        {association: "selectors"}
      ]
    }]
};

const storyReq = {
  include: [
    {association: "content", separate: true},
    {association: "authors", separate: true,
      include: [{association: "content", separate: true}]
    },
    {association: "descriptions", separate: true,
      include: [{association: "content", separate: true}]
    },
    {association: "footnotes", separate: true,
      include: [{association: "content", separate: true}]
    },
    {association: "selectors"},
    {
      association: "storysections", separate: true,
      include: [
        {association: "content", separate: true},
        {association: "descriptions", separate: true,
          include: [{association: "content", separate: true}]
        },
        {association: "stats", separate: true,
          include: [{association: "content", separate: true}]
        },
        {association: "subtitles", separate: true,
          include: [{association: "content", separate: true}]
        },
        {association: "visualizations", separate: true},
        {association: "selectors"}
      ]
    }
  ]
};

const sorter = (a, b) => a.ordering - b.ordering;

/**
 * Lang-specific content is stored in secondary tables, and are part of profiles as an
 * array called "content," which contains objects of region-specific translated keys.
 * We don't want the front end to have to even know about this sub-table or sub-array.
 * Therefore, bubble up the appropriate content to the top-level of the object
 */

const bubbleUp = (obj, locale) => {
  const fieldSet = [];
  obj.content.forEach(c => {
    Object.keys(c).forEach(k => {
      if (!fieldSet.includes(k)) fieldSet.push(k);
    });
  });
  const defCon = obj.content.find(c => c.locale === envLoc);
  const thisCon = obj.content.find(c => c.locale === locale);
  fieldSet.forEach(k => {
    if (k !== "id" && k !== "locale") {
      thisCon && thisCon[k] ? obj[k] = thisCon[k] : obj[k] = defCon ? defCon[k] : "";
    }
  });
  delete obj.content;
  return obj;
};

const extractLocaleContent = (sourceObj, locale, mode) => {
  const obj = bubbleUp(sourceObj, locale);
  if (mode === "story") {
    ["footnotes", "descriptions", "authors"].forEach(type => {
      if (obj[type]) obj[type] = obj[type].map(o => bubbleUp(o, locale));
    });
  }
  if (mode === "profile" || mode === "story") {
    const children = mode === "story" ? "storysections" : "sections";
    if (obj[children]) {
      obj[children] = obj[children].map(child => {
        child = bubbleUp(child, locale);
        ["subtitles", "descriptions", "stats"].forEach(type => {
          if (child[type]) child[type] = child[type].map(o => bubbleUp(o, locale));
        });
        return child;
      });
    }
  }
  if (mode === "section") {
    ["subtitles", "descriptions", "stats"].forEach(type => {
      if (obj[type]) obj[type] = obj[type].map(o => bubbleUp(o, locale));
    });
  }
  return obj;
};

module.exports = function(app) {

  const {cache, db} = app.settings;

  const fetchAttr = async(pid, dims, locale) => {
    // Fetch the profile itself, along with its meta content. The meta content will be used
    // to determine which levels should be used to filter the search results
    let profile = await db.profile.findOne({where: {id: pid}, include: [{association: "meta"}]}).catch(catcher);
    profile = profile.toJSON();
    // The attr object is used in createGeneratorFetch to swap things like <id> into the
    // id that is passed to the fetch. Create a lookup object of the search rows, of the
    // pattern (id/id1),id2,id3, so that unary profiles can access it without an integer.
    let attr = {};
    for (let i = 0; i < dims.length; i++) {
      const dim = dims[i];
      const thisMeta = profile.meta.find(d => d.slug === dim.slug);
      const levels = thisMeta ? thisMeta.levels : [];
      const cubeName = thisMeta ? thisMeta.cubeName : null;
      let searchReq;
      if (levels.length === 0) {
        searchReq = {where: {[sequelize.Op.or]: [{id: dim.id}, {slug: dim.id}], cubeName}};
      }
      else {
        searchReq = {where: {[sequelize.Op.and]: [{[sequelize.Op.or]: [{id: dim.id}, {slug: dim.id}], cubeName}, {hierarchy: {[sequelize.Op.in]: levels}}]}};
      }
      searchReq.include = [{association: "content"}];
      let thisAttr = await db.search.findOne(searchReq).catch(catcher);
      thisAttr = thisAttr ? thisAttr.toJSON() : {};
      if (thisAttr.content) {
        const defCon = thisAttr.content.find(c => c.locale === locale);
        thisAttr.name = defCon && defCon.name ? defCon.name : "";
      }
      if (i === 0) attr = Object.assign(attr, thisAttr);
      Object.keys(thisAttr).forEach(key => {
        attr[`${key}${i + 1}`] = thisAttr[key];
      });
    }
    return attr;
  };

  const createGeneratorFetch = (req, locale, r, attr) => {
    // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
    const origin = `${ req.protocol }://${ req.headers.host }`;
    let url = urlSwap(r, {...req.params, ...cache, ...attr, ...canonVars, locale});
    if (url.indexOf("http") !== 0) {
      url = `${origin}${url.indexOf("/") === 0 ? "" : "/"}${url}`;
    }

    const config = getConfig({timeout: GENERATOR_TIMEOUT});

    return axios.get(url, config)
      .then(resp => {
        if (verbose) console.log("Variable Loaded:", url);
        return resp;
      })
      .catch(() => {
        if (verbose) console.log("Variable Error:", url);
        return {};
      });
  };

  const runStoryGenerators = async(req, pid, id, smallAttr = {}) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    const genObj = id ? {where: {id}} : {where: {story_id: pid}};
    let generators = await db.story_generator.findAll(genObj).catch(catcher);
    generators = generators
      .map(g => g.toJSON())
      .filter(g => !g.allowed || g.allowed === "always" || smallAttr[g.allowed]);
    if (id && generators.length === 0) return {};

    const formatterFunctions = await formatters4eval(db, locale);

    const requests = Array.from(new Set(generators.map(g => g.api)));
    const fetches = requests.map(url => throttle.add(createGeneratorFetch.bind(this, req, locale, url, smallAttr)));
    const results = await Promise.all(fetches).catch(catcher);

    // Seed the return variables with the stripped-down attr object
    let returnVariables = {...smallAttr};
    const genStatus = {};
    const durations = {};
    results.forEach((r, i) => {
      // For every API result, find ONLY the generators that depend on this data
      const requiredGenerators = generators.filter(g => g.api === requests[i]);
      // Build the return object using a reducer, one generator at a time
      returnVariables = requiredGenerators.reduce((acc, g) => {
        const evalResults = mortarEval("resp", r.data, g.logic, formatterFunctions, locale, smallAttr);
        if (typeof evalResults.vars !== "object") evalResults.vars = {};
        // genStatus is used to track the status of each individual generator
        genStatus[g.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
        durations[g.id] = r.requestDuration;
        // Fold the generated variables into the accumulating returnVariables
        return {...acc, ...evalResults.vars};
      }, returnVariables);
    });
    // Set genstatus for all ids
    returnVariables._genStatus = genStatus;
    // Inject a special, hard-coded attr genstatus for the front-end
    returnVariables._genStatus.attributes = smallAttr;
    returnVariables._genStatus.durations = durations;
    return returnVariables;
  };

  const runGenerators = async(req, pid, id, smallAttr) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    const dims = collate(req.query);
    const attr = await fetchAttr(pid, dims, locale);
    if (!smallAttr) {
      // Strip the attr object down to just some relevant keys
      const smallKeys = ["id", "dimension", "hierarchy", "slug", "name", "cubeName"];
      smallAttr = Object.keys(attr).reverse().reduce((acc, k) => smallKeys.includes(k.replace(/\d+/g, "")) ? {[k]: attr[k], ...acc} : acc, {});
      // Retrieve user login data
      smallAttr.user = false;
      if (LOGINS && req.user) {
        // Extract sensitive data
        const {password, salt, ...user} = req.user; // eslint-disable-line
        smallAttr.user = user;
        // Bubble up userRole for easy access in front end (for hiding sections based on role)
        smallAttr.userRole = user.role;
      }
      // Fetch Parents
      const url = `${cubeRoot}/relations.jsonrecords?cube=${attr.cubeName}&${attr.hierarchy}=${attr.id}:parents`;
      const config = getConfig();
      const resp = await axios.get(url, config).catch(() => {
        if (verbose) console.log("Warning: Parent endpoint misconfigured or not available (mortarRoute)");
        return [];
      });
      if (resp && resp.data && resp.data.data && resp.data.data.length > 0) {
        smallAttr.parents = resp.data.data;
      }
      // If this request was made with a print flag, set the "showWhenPrinting" variable to false, so that sections that
      // use it in their allowed section will be hidden in for PDF printing.
      smallAttr.showWhenPrinting = req.query.print !== "true";
      // Fetch Custom Magic Generator
      const protocol = forceHTTPS ? "https" : req.protocol;
      const magicURL = `${ protocol }://${ req.headers.host }/api/cms/customAttributes/${pid}`;
      const magicResp = await axios.post(magicURL, {variables: smallAttr, locale}).catch(() => ({data: {}}));
      if (typeof magicResp.data === "object") {
        smallAttr = {...smallAttr, ...magicResp.data};
      }

    }
    const genObj = id ? {where: {id}} : {where: {profile_id: pid}};
    let generators = await db.generator.findAll(genObj).catch(catcher);
    generators = generators
      .map(g => g.toJSON())
      .filter(g => !g.allowed || g.allowed === "always" || smallAttr[g.allowed]);
    if (id && generators.length === 0) return {};

    const formatterFunctions = await formatters4eval(db, locale);

    const requests = Array.from(new Set(generators.map(g => g.api)));
    const fetches = requests.map(url => throttle.add(createGeneratorFetch.bind(this, req, locale, url, smallAttr)));
    const results = await Promise.all(fetches).catch(catcher);
    // Inject cms_search-level slugs into the payload to help with making front-end links
    for (let i = 0; i < requests.length; i++) {
      try {
        // slugs may include <vars> from magic generators (e.g., &slugs=Exporter:<hierarchy>). Run them through urlswap to sub in vars.
        const origin = `${ req.protocol }://${ req.headers.host }`;
        let thisURL = urlSwap(requests[i], {...req.params, ...cache, ...smallAttr, ...canonVars, locale});
        if (thisURL.indexOf("http") !== 0) {
          thisURL = `${origin}${thisURL.indexOf("/") === 0 ? "" : "/"}${thisURL}`;
        }
        const thisResult = results[i].data && results[i].data.data ? results[i].data.data : [];
        const url = new URL(thisURL);
        const paramObject = Object.fromEntries(new URLSearchParams(url.search));
        if (paramObject.slugs && thisResult.length > 0) {
          const {slugs} = paramObject;
          const pairs = slugs.split(",");
          for (const pair of pairs) {
            let cubeName, dimension, idPattern;
            if (pair.includes(":")) {
              const list = pair.split(":");
              dimension = list[0];
              idPattern = list[1];
              if (list[2]) cubeName = list[2];
            }
            else {
              dimension = pair;
              idPattern = pair;
            }
            const ids = thisResult.map(d => String(d[`${idPattern} ID`] || d[idPattern]));
            const where = {dimension, id: ids};
            if (cubeName) where.cubeName = cubeName;
            const members = await db.search.findAll({where}).catch(catcher);
            const slugMap = members.reduce((acc, d) => ({...acc, [d.id]: d.slug}), {});
            results[i].data.data = results[i].data.data.map(d => ({...d, [`${idPattern} Slug`]: slugMap[d[`${idPattern} ID`] || d[idPattern]]}));
          }
        }
      }
      catch (e) {
        if (verbose) console.error(`Slug lookup failed. ${e}`);
      }
    }

    // Seed the return variables with the stripped-down attr object
    let returnVariables = {...smallAttr};
    const genStatus = {};
    const durations = {};
    results.forEach((r, i) => {
      // For every API result, find ONLY the generators that depend on this data
      const requiredGenerators = generators.filter(g => g.api === requests[i]);
      // Build the return object using a reducer, one generator at a time
      returnVariables = requiredGenerators.reduce((acc, g) => {
        const evalResults = mortarEval("resp", r.data, g.logic, formatterFunctions, locale, smallAttr);
        if (typeof evalResults.vars !== "object") evalResults.vars = {};
        // genStatus is used to track the status of each individual generator
        genStatus[g.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
        durations[g.id] = r.requestDuration;
        // Fold the generated variables into the accumulating returnVariables
        return {...acc, ...evalResults.vars};
      }, returnVariables);
    });
    // Set genstatus for all ids
    returnVariables._genStatus = genStatus;
    // Inject a special, hard-coded attr genstatus for the front-end
    returnVariables._genStatus.attributes = smallAttr;
    returnVariables._genStatus.durations = durations;
    return returnVariables;

  };

  app.get("/api/story_generators/:pid", async(req, res) => res.json(await runStoryGenerators(req, req.params.pid, req.query.story_generator)));
  app.post("/api/story_generators/:pid", async(req, res) => res.json(await runStoryGenerators(req, req.params.pid, req.query.story_generator, req.body.attributes)));
  app.get("/api/generators/:pid", async(req, res) => res.json(await runGenerators(req, req.params.pid, req.query.generator)));
  app.post("/api/generators/:pid", async(req, res) => res.json(await runGenerators(req, req.params.pid, req.query.generator, req.body.attributes)));

  const runMaterializers = async(req, variables, pid, isStory) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    let materializers;
    if (isStory) {
      materializers = await db.story_materializer.findAll({where: {story_id: pid}}).catch(catcher);
    }
    else {
      materializers = await db.materializer.findAll({where: {profile_id: pid}}).catch(catcher);
    }
    materializers = materializers
      .map(m => m.toJSON())
      .filter(m => !m.allowed || m.allowed === "always" || variables[m.allowed]);
    if (materializers.length === 0) return variables;

    // The order of materializers matters because input to later materializers depends on output from earlier materializers
    materializers.sort((a, b) => a.ordering - b.ordering);
    const formatterFunctions = await formatters4eval(db, locale);
    let returnVariables = variables;
    const matStatus = {};
    returnVariables = materializers.reduce((acc, m) => {
      const evalResults = mortarEval("variables", acc, m.logic, formatterFunctions, locale);
      if (typeof evalResults.vars !== "object") evalResults.vars = {};
      matStatus[m.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
      return {...acc, ...evalResults.vars};
    }, returnVariables);
    returnVariables._matStatus = matStatus;
    return returnVariables;
  };

  app.post("/api/materializers/:pid", async(req, res) => {
    const {pid} = req.params;
    const {variables} = req.body;
    const materializer = await db.materializer.findOne({where: {profile_id: pid}}).catch(catcher);
    if (!materializer) return res.json({});
    return res.json(await runMaterializers(req, variables, materializer.profile_id));
  });

  app.post("/api/story_materializers/:pid", async(req, res) => {
    const {pid} = req.params;
    const {variables} = req.body;
    const materializer = await db.story_materializer.findOne({where: {story_id: pid}}).catch(catcher);
    if (!materializer) return res.json({});
    return res.json(await runMaterializers(req, variables, materializer.story_id, true));
  });

  /* Main API Route to fetch a profile, given a list of slug/id pairs
   * slugs represent the type of page (geo, naics, soc, cip, university)
   * ids represent actual entities / locations (nyc, bu)
  */

  const fetchProfile = async(req, res) => {
    // take an arbitrary-length query of slugs and ids and turn them into objects
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    const locale = req.query.locale || envLoc;
    const origin = `${ req.protocol }://${ req.headers.host }`;

    const dims = collate(req.query);

    const sectionID = req.query.section;
    const profileID = req.query.profile;

    let pid = null;
    // map slugs to their profile_meta row, for when we query profile_meta below
    const slugMap = {};
    // If the user provided variables, this is a POST request.
    if (req.body.variables) {
      // If the user gave us a section or a profile id, use that to fetch the pid.
      if (sectionID) {
        const where = isNaN(parseInt(sectionID, 10)) ? {slug: sectionID} : {id: sectionID};
        const t = await db.section.findOne({where}).catch(catcher);
        if (t) {
          pid = t.profile_id;
        }
        else {
          if (verbose) console.error(`Profile not found for section: ${sectionID}`);
          return res.json({error: `Profile not found for section: ${sectionID}`, errorCode: 404});
        }
      }
      else if (profileID) {
        pid = profileID;
      }
    }
    // Otherwise, we need to reverse lookup the profile id, using the slug combinations
    else {
      // Given a list of dimension slugs, use the meta table to reverse-lookup which profile this is
      // TODO: In good-dooby land, this should be a massive, complicated sequelize Op.AND lookup.
      // To avoid that complexity, I am fetching the entire (small) meta table and using JS to find the right one.
      let meta = await db.profile_meta.findAll();
      meta = meta.map(d => d.toJSON());
      meta.forEach(d => slugMap[d.slug] = d);
      const match = dims.map(d => d.slug).join();
      let profiles = await db.profile.findAll();
      profiles = profiles.map(d => d.toJSON());
      const pidvisible = profiles.reduce((acc, d) => ({...acc, [d.id]: d.visible}), {});

      try {
        // Profile slugs are unique, so it is sufficient to use the first slug as a "profile finder"
        const potentialPid = meta.find(m => m.slug === dims[0].slug && m.ordering === 0 && m.visible).profile_id;
        // However, still confirm that the second slug matches (if provided)
        if (dims[1] && dims[1].slug) {
          const potentialSecondSlugs = meta.filter(m => m.profile_id === potentialPid && m.ordering === 1).map(d => d.slug);
          if (potentialSecondSlugs.includes(dims[1].slug)) {
            if (pidvisible[potentialPid]) pid = potentialPid;
          }
        }
        else {
          if (pidvisible[potentialPid]) pid = potentialPid;
        }
      }
      catch (e) {
        if (verbose) console.error(`Profile not found for slug: ${match}. Error: ${e}`);
        return res.json({error: `Profile not found for slug: ${match}`, errorCode: 404});
      }
      if (!pid) {
        if (verbose) console.error(`Profile not found for slug: ${match}`);
        return res.json({error: `Profile not found for slug: ${match}`, errorCode: 404});
      }
    }

    // Sometimes the id provided will be a "slug" like massachusetts instead of 0400025US
    // Replace that slug with the actual real id from the search table. To do this, however,
    // We need the meta from the profile so we can filter by cubename.
    let idCount = 0;
    for (let i = 0; i < dims.length; i++) {
      const dim = dims[i];
      const meta = await db.profile_meta.findOne({where: {slug: dim.slug}});
      if (meta && meta.cubeName) {
        const attribute = await db.search.findOne({where: {slug: dim.id, cubeName: meta.cubeName}}).catch(catcher);
        if (attribute && attribute.id) {
          dim.memberSlug = dim.id;
          dim.id = attribute.id;
        }
        else {
          idCount++;
        }
      }
    }
    // To support redirects, track whether any of the provided ids were raw ids like 0400025US. Later in the code, once the
    // profile routing has been confirmed, return a redirect to the slug version if any raw ids were used.
    const usedIDs = idCount > 0;

    let returnObject = {};
    let variables = {};
    // If the user has provided variables, this is a POST request. Use those variables,
    // And skip the entire variable fetching process.
    if (req.body.variables) {
      // If the forceMats option was provided, use the POSTed variables to run
      // Materializers. Used for Login in ProfileRenderer.jsx
      if (req.query.forceMats === "true") {
        variables = await runMaterializers(req, req.body.variables, pid);
      }
      else {
        variables = req.body.variables;
      }
    }
    // If the user has not provided variables, this is a GET request. Run Generators.
    else {
      // Before we hit the variables endpoint, confirm that all provided ids exist.
      // If they do exist, query and load their neighbors into the payload
      const neighborsByDimSlug = {};
      const foundMembers = [];
      for (const dim of dims) {
        const thisMeta = slugMap[dim.slug];
        if (thisMeta) {
          const {dimension, cubeName} = thisMeta;
          let searchrow = await db.search.findOne({
            where: {id: dim.id, dimension, cubeName},
            include: [{association: "content"}]
          }).catch(catcher);
          if (!searchrow) {
            if (verbose) console.error(`Member not found for id: ${dim.id}`);
            return res.json({error: `Member not found for id: ${dim.id}`, errorCode: 404});
          }
          else {
            // Prime the top result of the neighbors with this member itself. This will be
            // needed later if we need to build bilateral profiles
            searchrow = searchrow.toJSON();
            foundMembers.push(searchrow);
            const defCon = searchrow.content.find(c => c.locale === envLoc);
            searchrow.name = defCon && defCon.name ? defCon.name : searchrow.slug;
            neighborsByDimSlug[dim.slug] = [searchrow];
            const {id} = searchrow;
            let {hierarchy} = searchrow;
            // hierarchies must be unique, so some have a unique_name that must be discovered. This requires checking the cube.
            const cubeData = await axios
              .get(`${cubeRoot}/cubes/${cubeName}`)
              .then(d => d.data)
              .catch(catcher);
            try {
              const uniqueName = cubeData.dimensions
                .find(d => d.name === searchrow.dimension).hierarchies[0].levels
                .find(d => d.name === hierarchy).unique_name;
              if (uniqueName) hierarchy = uniqueName;
            }
            catch (e) {
              if (verbose) console.error(`Error in neighbor dimension lookup: ${e}`);
            }
            const getNeighborsForId = async id => {
              const members = [];
              const url = `${cubeRoot}/relations.jsonrecords?cube=${cubeName}&${hierarchy}=${id}:neighbors`;
              const config = getConfig();
              // Now that we have a correct hierarchy/level, query the neighbors endpoint
              const neighbors = await axios
                .get(url, config)
                .then(d => d && d.data && d.data.data && Array.isArray(d.data.data) ? d.data.data : [])
                .catch(catcher);
              // Fetch the FULL members for each neighbor and collate them by dimension slug
              for (const neighbor of neighbors) {
                const member = await db.search.findOne({
                  where: {id: neighbor.value, dimension, cubeName},
                  include: [{association: "content"}]
                }).catch(catcher);
                if (member) {
                  // Some of the neighbors may have had {show:false} added to their attributes, don't show these
                  const hidden = member.content.map(d => d.attr).some(d => d && d.show !== undefined && d.show === false);
                  if (!hidden) members.push(member.toJSON());
                }
              }
              return members;
            };
            const potentialNeighbors = await getNeighborsForId(id);
            // If the neighbors length has been lessened due to {show:false} neighbors, try to "pad it out"
            // with one additional neighbor lookup of the first member and attempt to fold these in.
            if (potentialNeighbors.length < 4 && potentialNeighbors[0]) {
              const firstId = potentialNeighbors[0].id;
              const newNeighbors = await getNeighborsForId(firstId);
              newNeighbors.forEach(nn => {
                if (potentialNeighbors.length < 4 && nn.id !== id && !potentialNeighbors.map(d => d.id).includes(nn.id)) {
                  potentialNeighbors.push(nn);
                }
              });
            }
            neighborsByDimSlug[dim.slug] = neighborsByDimSlug[dim.slug].concat(potentialNeighbors);
          }
        }
        else {
          if (verbose) console.error(`Member not found for id: ${dim.id}`);
          return res.json({error: `Member not found for id: ${dim.id}`, errorCode: 404});
        }
      }
      // If IDs were used, send back a 301 redirect to the client, with information on how to route the request (slugs)
      if (usedIDs) {
        const originalDims = collate(req.query);
        const error = `Page request was made using ids [${originalDims.map(d => d.id).join()}]. Redirecting.`;
        if (verbose) console.log(error);
        const canonRedirect = dims.reduce((acc, d, i) => {
          if (i === 0) {
            acc.slug = d.slug;
            acc.id = foundMembers[i].slug;
          }
          acc[`slug${i + 1}`] = d.slug;
          acc[`id${i + 1}`] = foundMembers[i].slug;
          return acc;
        }, {});
        return res.json({error, errorCode: 301, canonRedirect});
      }
      // todo - catch for no neighbors ?
      returnObject.neighbors = [];
      // Using the now-populated neighborsByDimSlug, construct a "neighbors" array filled
      // with profile objects that can be linkify'd on the front end
      const neighborDims = Object.keys(neighborsByDimSlug);
      // If this is a unary profile, just use the neighbors straight-up
      if (neighborDims.length === 1) {
        const thisSlug = neighborDims[0];
        // Remember - remove the self-referential first element!
        const neighborMembers = neighborsByDimSlug[thisSlug].slice(1);
        neighborMembers.forEach(nm => {
          const defCon = nm.content.find(c => c.locale === envLoc);
          returnObject.neighbors.push([{
            id: nm.id,
            slug: thisSlug,
            memberSlug: nm.slug,
            name: defCon && defCon.name ? defCon.name : nm.slug
          }]);
        });
      }
      // However, if it's bilateral, scaffold out some matches
      else if (neighborDims.length === 2) {
        const thisSlug = neighborDims[0];
        const thatSlug = neighborDims[1];
        const thisMember = neighborsByDimSlug[thisSlug][0];
        const thatMember = neighborsByDimSlug[thatSlug][0];
        // Remove the leading self-referential element, and avoid collisions as to not recommend a member matched with itself
        const thisNeighborMembers = neighborsByDimSlug[thisSlug].slice(1).filter(d => d.id !== thatMember.id);
        const thatNeighborMembers = neighborsByDimSlug[thatSlug].slice(1).filter(d => d.id !== thisMember.id);
        // A full set of 4 neighbors means that no neighbors were removed for being hidden or self-referential. In that
        // case, given neighbors 0123, 1 and 2 (the "middle" ones) are actually the "closest". Shift the 0th member off
        // the list, so that the ensuing slice(0, 2) properly chooses the middle ones. In other cases just default to (0, 2).
        if (thisNeighborMembers.length === 4) thisNeighborMembers.shift();
        if (thatNeighborMembers.length === 4) thatNeighborMembers.shift();
        thatNeighborMembers.slice(0, 2).forEach(nm => {
          const defCon = nm.content.find(c => c.locale === envLoc);
          returnObject.neighbors.push([
            {
              id: thisMember.id,
              slug: thisSlug,
              memberSlug: thisMember.slug,
              name: thisMember.name
            },
            {
              id: nm.id,
              slug: thatSlug,
              memberSlug: nm.slug,
              name: defCon && defCon.name ? defCon.name : nm.slug
            }
          ]);
        });
        thisNeighborMembers.slice(0, 2).forEach(nm => {
          const defCon = nm.content.find(c => c.locale === envLoc);
          returnObject.neighbors.push([
            {
              id: nm.id,
              slug: thisSlug,
              memberSlug: nm.slug,
              name: defCon && defCon.name ? defCon.name : nm.slug
            },
            {
              id: thatMember.id,
              slug: thatSlug,
              memberSlug: thatMember.slug,
              name: thatMember.name
            }
          ]);
        });
      }

      if (verbose) console.log("\n\nFetching Variables for pid:", pid);
      const generatorVariables = await runGenerators(req, pid);
      variables = await runMaterializers(req, generatorVariables, pid);

      delete variables._genStatus;
      delete variables._matStatus;
    }

    const formatterFunctions = await formatters4eval(db, locale);
    // Given the completely built returnVariables and all the formatters (formatters are global)
    // Get the raw, unswapped, user-authored profile itself and all its dependencies and prepare
    // it to be formatted and regex replaced.
    // Go through the profile and replace all the provided {{vars}} with the actual variables we've built
    // Create a "post-processed" profile by swapping every {{var}} with a formatted variable
    if (verbose) console.log("Variables Loaded, starting varSwap...");
    // See profileReq above to see the sequelize formatting for fetching the entire profile
    let profile;
    if (variables._rawProfile) {
      profile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, req.query);
    }
    else {
      const reqObj = Object.assign({}, profileReq, {where: {id: pid}});
      const rawProfile = await db.profile.findOne(reqObj).catch(catcher);
      if (rawProfile) {
        variables._rawProfile = rawProfile.toJSON();
        // The ensuing varSwap requires a top-level array of all possible selectors, so that it can apply
        // their selSwap lookups to all contained sections. This is separate from the section-level selectors (below)
        // which power the actual rendered dropdowns on the front-end profile page.
        let allSelectors = await db.selector.findAll({where: {profile_id: pid}}).catch(catcher);
        allSelectors = allSelectors.map(d => d.toJSON());
        variables._rawProfile.allSelectors = allSelectors;
        let allMaterializers = await db.materializer.findAll({where: {profile_id: pid}}).catch(catcher);
        allMaterializers = allMaterializers.map(d => {
          d = d.toJSON();
          // make use of varswap for its buble transpiling, so the front end can run es5 code.
          d = varSwapRecursive(d, formatterFunctions, variables);
          return d;
        }).sort((a, b) => a.ordering - b.ordering);
        variables._rawProfile.allMaterializers = allMaterializers;
        profile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, req.query);
      }
      else {
        if (verbose) console.error(`Profile not found for id: ${pid}`);
        return res.json({error: `Profile not found for id: ${pid}`, errorCode: 404});
      }
    }
    // If the user provided a section ID in the query, that's all they want. Filter to return just that.
    if (sectionID) {
      profile.sections = profile.sections.filter(t => Number(t.id) === Number(sectionID) || t.slug === sectionID);
    }
    returnObject = Object.assign({}, returnObject, profile);
    returnObject.ids = dims.map(d => d.id).join();
    returnObject.dims = dims;
    // The provided ids may have images associated with them, and these images have metadata. Before we send
    // The object, we need to make a request to our /api/image endpoint to get any relevant image data.
    // Note! Images are strictly ordered to match your strictly ordered slug/id pairs
    const images = [];
    for (const dim of dims) {
      const url = `${origin}/api/image?slug=${dim.slug}&memberSlug=${dim.memberSlug}&locale=${locale}&type=json`;
      const image = await axios.get(url).then(d => d.data).catch(catcher);
      images.push(image ? image.image : null);
    }
    returnObject.images = images;
    if (verbose) console.log("varSwap complete, sending json...");
    return res.json(returnObject);
  };

  /* There are two ways to fetch a profile:
   * GET - the initial GET operation on pageload, performed by a need
   * POST - a subsequent reload, caused by a dropdown change, requiring the user
   *        to provide the variables object previous received in the GET
   * The following two endpoints route those two option to the same code.
  */

  app.get("/api/profile", async(req, res) => await fetchProfile(req, res));
  app.post("/api/profile", async(req, res) => await fetchProfile(req, res));

  const fetchStory = async(req, res) => {
    // take an arbitrary-length query of slugs and ids and turn them into objects
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    let {id} = req.params;
    // Using a Sequelize OR when the two OR columns are of different types causes a Sequelize error, necessitating this workaround.
    const thisStory = await db.story.findOne(!isNaN(id) ? {where: {id}} : {where: {slug: id}}).catch(catcher);
    if (!thisStory) {
      if (verbose) console.error(`Story not found for id: ${id}`);
      return res.json({error: `Story not found for id: ${id}`, errorCode: 404});
    }
    id = thisStory.id;
    const locale = req.query.locale || envLoc;
    let returnObject = {};
    let variables = {};

    if (verbose) console.log("\n\nFetching Variables for pid:", id);
    const generatorVariables = await runStoryGenerators(req, id);
    variables = await runMaterializers(req, generatorVariables, id, true);

    delete variables._genStatus;
    delete variables._matStatus;

    const formatterFunctions = await formatters4eval(db, locale);
    if (verbose) console.log("Variables Loaded, starting varSwap...");

    let story;

    const reqObj = !isNaN(id) ? Object.assign({}, storyReq, {where: {id}}) : Object.assign({}, storyReq, {where: {slug: id}});
    const rawStory = await db.story.findOne(reqObj).catch(catcher);
    if (rawStory) {
      variables._rawStory = rawStory.toJSON();
      // The ensuing varSwap requires a top-level array of all possible selectors, so that it can apply
      // their selSwap lookups to all contained sections. This is separate from the section-level selectors (below)
      // which power the actual rendered dropdowns on the front-end profile page.
      let allSelectors = await db.story_selector.findAll({where: {story_id: id}}).catch(catcher);
      allSelectors = allSelectors.map(d => d.toJSON());
      variables._rawStory.allSelectors = allSelectors;
      let allMaterializers = await db.story_materializer.findAll({where: {story_id: id}}).catch(catcher);
      allMaterializers = allMaterializers
        .map(d => {
          d = d.toJSON();
          // make use of varswap for its buble transpiling, so the front end can run es5 code.
          d = varSwapRecursive(d, formatterFunctions, variables);
          return d;
        })
        .sort((a, b) => a.ordering - b.ordering);
      variables._rawStory.allMaterializers = allMaterializers;
      story = prepareStory(variables._rawStory, variables, formatterFunctions, locale, req.query);
    }
    else {
      if (verbose) console.error(`Story not found for id: ${id}`);
      return res.json({error: `Story not found for id: ${id}`, errorCode: 404});
    }
    returnObject = Object.assign({}, returnObject, story);
    if (verbose) console.log("varSwap complete, sending json...");
    return res.json(returnObject);
  };

  app.get("/api/story/:id", async(req, res) => await fetchStory(req, res));

  // Endpoint for getting all stories
  app.get("/api/story", async(req, res) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    let stories = await db.story.findAll({include: [
      {association: "content"},
      {association: "authors", include: [
        {association: "content", attributes: ["name", "title", "image", "twitter", "bio", "locale"]}
      ]}
    ]}).catch(catcher);
    const now = Date.now();
    stories = stories
      .map(story => extractLocaleContent(story.toJSON(), locale, "story"))
      .filter(story => story.visible && story.date < now);
    return res.json(stories.sort(sorter));
  });

};
