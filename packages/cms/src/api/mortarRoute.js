const FUNC = require("../utils/FUNC"),
      PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      collate = require("../utils/collate"),
      jwt = require("jsonwebtoken"),
      libs = require("../utils/libs"), // leave this! needed for the variable functions
      mortarEval = require("../utils/mortarEval"),
      sequelize = require("sequelize"),
      urlSwap = require("../utils/urlSwap"),
      varSwapRecursive = require("../utils/varSwapRecursive"),
      yn = require("yn");

const {
  CANON_CMS_MINIMUM_ROLE,
  OLAP_PROXY_SECRET
} = process.env;

const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";

const catcher = e => {
  if (verbose) console.error("Error in mortarRoute: ", e);
  return [];
};

const LANGUAGE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "canon";
const LANGUAGES = process.env.CANON_LANGUAGES || LANGUAGE_DEFAULT;
const LOGINS = process.env.CANON_LOGINS || false;
const PORT = process.env.CANON_PORT || 3300;
const NODE_ENV = process.env.NODE_ENV || "development";
const REQUESTS_PER_SECOND = process.env.CANON_CMS_REQUESTS_PER_SECOND ? parseInt(process.env.CANON_CMS_REQUESTS_PER_SECOND, 10) : 20;
let cubeRoot = process.env.CANON_CMS_CUBES;
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
        {association: "visualizations", separate: true}
      ]
    }
  ]
};

const formatters4eval = async(db, locale) => {

  const formatters = await db.formatter.findAll().catch(catcher);

  return formatters.reduce((acc, f) => {

    const name = f.name === f.name.toUpperCase()
      ? f.name.toLowerCase()
      : f.name.replace(/^\w/g, chr => chr.toLowerCase());

    // Formatters may be malformed. Wrap in a try/catch to avoid js crashes.
    try {
      acc[name] = FUNC.parse({logic: f.logic, vars: ["n"]}, acc, locale);
    }
    catch (e) {
      console.error(`Server-side Malformed Formatter encountered: ${name}`);
      console.error(`Error message: ${e.message}`);
      acc[name] = FUNC.parse({logic: "return \"N/A\";", vars: ["n"]}, acc, locale);
    }

    return acc;

  }, {});
};

const sorter = (a, b) => a.ordering - b.ordering;

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. Eventually move it up to the query.
const sortProfile = profile => {
  profile.meta.sort(sorter);
  if (profile.sections) {
    profile.sections.sort(sorter);
    profile.sections.forEach(section => {
      if (section.subtitles) section.subtitles.sort(sorter);
      if (section.selectors) section.selectors.sort(sorter);
      if (section.stats) section.stats.sort(sorter);
      if (section.descriptions) section.descriptions.sort(sorter);
      if (section.visualizations) section.visualizations.sort(sorter);
    });
  }
  return profile;
};

const sortStory = story => {
  ["descriptions", "footnotes", "authors", "storysections"].forEach(type => story[type].sort(sorter));
  story.storysections.forEach(storysection => {
    ["descriptions", "stats", "subtitles", "visualizations"].forEach(type => storysection[type].sort(sorter));
  });
  return story;
};

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

const extractLocaleContent = (obj, locale, mode) => {
  obj = obj.toJSON();
  obj = bubbleUp(obj, locale);
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

  app.get("/api/internalprofile/:pid", async(req, res) => {
    const id = req.params.pid;
    const locale = req.query.locale ? req.query.locale : envLoc;
    const reqObj = Object.assign({}, profileReq, {where: {id}});
    const profile = await db.profile.findOne(reqObj).catch(catcher);
    return res.json(sortProfile(extractLocaleContent(profile, locale, "profile")));
  });

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
        searchReq = {where: {id: dim.id, cubeName}};
      }
      else {
        searchReq = {where: {[sequelize.Op.and]: [{id: dim.id, cubeName}, {hierarchy: {[sequelize.Op.in]: levels}}]}};
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
      const config = {};
      if (OLAP_PROXY_SECRET) {
        const jwtPayload = {sub: "server", status: "valid"};
        if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
        const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
        config.headers = {"x-tesseract-jwt-token": apiToken};
      }
      const resp = await axios.get(url, config).catch(() => {
        if (verbose) console.log("Warning: Parent endpoint misconfigured or not available (mortarRoute)");
        return [];
      });
      if (resp && resp.data && resp.data.data && resp.data.data.length > 0) {
        smallAttr.parents = resp.data.data;
      }
    }
    const genObj = id ? {where: {id}} : {where: {profile_id: pid}};
    let generators = await db.generator.findAll(genObj).catch(catcher);
    if (id && generators.length === 0) return {};
    generators = generators.map(g => g.toJSON());

    /** */
    function createGeneratorFetch(r, attr) {
      // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
      const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
      let url = urlSwap(r, {...req.params, ...cache, ...attr, ...canonVars, locale});
      if (url.indexOf("http") !== 0) {
        url = `${origin}${url.indexOf("/") === 0 ? "" : "/"}${url}`;
      }

      const config = {};
      if (OLAP_PROXY_SECRET) {
        const jwtPayload = {sub: "server", status: "valid"};
        if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
        const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
        config.headers = {"x-tesseract-jwt-token": apiToken};
      }

      return axios.get(url, config)
        .then(resp => {
          if (verbose) console.log("Variable Loaded:", url);
          return resp;
        })
        .catch(() => {
          if (verbose) console.log("Variable Error:", url);
          return {};
        });
    }

    const formatterFunctions = await formatters4eval(db, locale);

    const requests = Array.from(new Set(generators.map(g => g.api)));
    const fetches = requests.map(url => throttle.add(createGeneratorFetch.bind(this, url, smallAttr)));
    const results = await Promise.all(fetches).catch(catcher);

    // Seed the return variables with the stripped-down attr object
    let returnVariables = {...smallAttr};
    const genStatus = {};
    results.forEach((r, i) => {
      // For every API result, find ONLY the generators that depend on this data
      const requiredGenerators = generators.filter(g => g.api === requests[i]);
      // Build the return object using a reducer, one generator at a time
      returnVariables = requiredGenerators.reduce((acc, g) => {
        const evalResults = mortarEval("resp", r.data, g.logic, formatterFunctions, locale, smallAttr);
        const {vars} = evalResults;
        // genStatus is used to track the status of each individual generator
        genStatus[g.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
        // Fold the generated variables into the accumulating returnVariables
        return {...acc, ...vars};
      }, returnVariables);
    });
    // Set genstatus for all ids
    returnVariables._genStatus = genStatus;
    // Inject a special, hard-coded attr genstatus for the front-end
    returnVariables._genStatus.attributes = smallAttr;

    return returnVariables;

  };

  app.get("/api/generators/:pid", async(req, res) => res.json(await runGenerators(req, req.params.pid, req.query.generator)));
  app.post("/api/generators/:pid", async(req, res) => res.json(await runGenerators(req, req.params.pid, req.query.generator, req.body.attributes)));

  const runMaterializers = async(req, variables, pid) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    let materializers = await db.materializer.findAll({where: {profile_id: pid}}).catch(catcher);
    if (materializers.length === 0) return variables;
    materializers = materializers.map(m => m.toJSON());

    // The order of materializers matters because input to later materializers depends on output from earlier materializers
    materializers.sort((a, b) => a.ordering - b.ordering);
    const formatterFunctions = await formatters4eval(db, locale);
    let returnVariables = variables;
    const matStatus = {};
    returnVariables = materializers.reduce((acc, m) => {
      const evalResults = mortarEval("variables", acc, m.logic, formatterFunctions, locale);
      const {vars} = evalResults;
      matStatus[m.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
      return {...acc, ...vars};
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

  const fetchVariables = async(req, res) => {
    const {pid} = req.params;

    if (verbose) console.log("\n\nVariable Endpoint:", `/api/variables/${pid}`);

    let returnVariables = await runGenerators(req, pid);
    returnVariables = await runMaterializers(req, returnVariables, pid);

    return res.json(returnVariables);
  };

  /* There are two ways to fetch variables:
   * GET - the initial GET operation on CMS or Profile load, performed by a need
   * POST - a subsequent reload, caused by a generator change, requiring the user
   *        to provide the variables object previous received in the GET
   * The following two endpoints route those two options to the same code.
  */

  app.get("/api/variables/:pid", async(req, res) => await fetchVariables(req, res));
  app.post("/api/variables/:pid", async(req, res) => await fetchVariables(req, res));

  /* Main API Route to fetch a profile, given a list of slug/id pairs
   * slugs represent the type of page (geo, naics, soc, cip, university)
   * ids represent actual entities / locations (nyc, bu)
  */

  const fetchProfile = async(req, res) => {
    // take an arbitrary-length query of slugs and ids and turn them into objects
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    const locale = req.query.locale || envLoc;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
    const localeString = `?locale=${locale}`;

    const dims = collate(req.query);
    // Sometimes the id provided will be a "slug" like massachusetts instead of 0400025US
    // Replace that slug with the actual real id from the search table.
    for (let i = 0; i < dims.length; i++) {
      const dim = dims[i];
      const attribute = await db.search.findOne({where: {slug: dim.id}}).catch(catcher);
      if (attribute && attribute.id) dim.id = attribute.id;
    }

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
          return res.json({error: `Profile not found for section: ${sectionID}`});
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
      try {
        // Profile slugs are unique, so it is sufficient to use the first slug as a "profile finder"
        const potentialPid = meta.find(m => m.slug === dims[0].slug && m.ordering === 0).profile_id;
        // However, still confirm that the second slug matches (if provided)
        if (dims[1] && dims[1].slug) {
          const potentialSecondSlugs = meta.filter(m => m.profile_id === potentialPid && m.ordering === 1).map(d => d.slug);
          if (potentialSecondSlugs.includes(dims[1].slug)) {
            pid = potentialPid;
          }
        }
        else {
          pid = potentialPid;
        }
      }
      catch (e) {
        if (verbose) console.error(`Profile not found for slug: ${match}. Error: ${e}`);
        return res.json({error: `Profile not found for slug: ${match}`});
      }
      if (!pid) {
        if (verbose) console.error(`Profile not found for slug: ${match}`);
        return res.json({error: `Profile not found for slug: ${match}`});
      }
    }
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
            return res.json({error: `Member not found for id: ${dim.id}`});
          }
          else {
            // Prime the top result of the neighbors with this member itself. This will be
            // needed later if we need to build bilateral profiles
            searchrow = searchrow.toJSON();
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
            // Now that we have a correct hierarchy/level, query the neighbors endpoint
            const neighbors = await axios
              .get(`${cubeRoot}/relations.jsonrecords?cube=${cubeName}&${hierarchy}=${id}:neighbors`)
              .then(d => d.data.data)
              .catch(catcher);
            // Fetch the FULL members for each neighbor and collate them by dimension slug
            for (const neighbor of neighbors) {
              const member = await db.search.findOne({
                where: {id: neighbor.value, dimension, cubeName},
                include: [{association: "content"}]
              }).catch(catcher);
              if (member) neighborsByDimSlug[dim.slug].push(member.toJSON());
            }
          }
        }
        else {
          if (verbose) console.error(`Member not found for id: ${dim.id}`);
          return res.json({error: `Member not found for id: ${dim.id}`});
        }
      }
      // todo tomorrow - catch for no neighbors ?
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
        const thisNeighborMembers = neighborsByDimSlug[thisSlug].slice(1);
        const thatNeighborMembers = neighborsByDimSlug[thatSlug].slice(1);
        thatNeighborMembers.slice(1, 3).forEach(nm => {
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
        thisNeighborMembers.slice(1, 3).forEach(nm => {
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

      // Get the variables for this profile by passing the profile id and the content ids
      let url = `${origin}/api/variables/${pid}${localeString}`;
      dims.forEach((dim, i) => {
        url += `&slug${i + 1}=${dim.slug}&id${i + 1}=${dim.id}`;
      });

      const variablesResp = await axios.get(url).catch(catcher);
      variables = variablesResp.data;
      delete variables._genStatus;
      delete variables._matStatus;
    }

    const formatterFunctions = await formatters4eval(db, locale);
    // Given the completely built returnVariables and all the formatters (formatters are global)
    // Get the raw, unswapped, user-authored profile itself and all its dependencies and prepare
    // it to be formatted and regex replaced.
    // See profileReq above to see the sequelize formatting for fetching the entire profile
    const request = await axios.get(`${origin}/api/internalprofile/${pid}${localeString}`).catch(catcher);
    if (!request) {
      if (verbose) console.error(`Profile not found for id: ${pid}`);
      return res.json(`Profile not found for id: ${pid}`);
    }
    // Given an object with completely built returnVariables, a hash array of formatter functions, and the profile itself
    // Go through the profile and replace all the provided {{vars}} with the actual variables we've built
    // Create a "post-processed" profile by swapping every {{var}} with a formatted variable
    if (verbose) console.log("Variables Loaded, starting varSwap...");
    let profile = request.data;
    // Each section will require references to all selectors
    let allSelectors = await db.selector.findAll({where: {profile_id: profile.id}}).catch(catcher);
    allSelectors = allSelectors.map(as => as.toJSON());
    profile.selectors = allSelectors;
    profile = varSwapRecursive(profile, formatterFunctions, variables, req.query);
    // If the user provided selectors in the query, then the user has changed a dropdown.
    // This means that OTHER dropdowns on the page need to be set to match. To accomplish
    // this, hijack the "default" property on any matching selector so the dropdowns "start"
    // where we want them to.
    profile.sections.forEach(section => {
      section.selectors.forEach(selector => {
        const {name} = selector;
        // If the user provided a selector in the query, AND if it's actually an option
        if (req.query[name] && selector.options.map(o => o.option).includes(req.query[name])) {
          selector.default = req.query[name];
        }
      });
    });
    // If the user provided a section ID in the query, that's all they want. Filter to return just that.
    if (sectionID) {
      profile.sections = profile.sections.filter(t => Number(t.id) === Number(sectionID) || t.slug === sectionID);
    }
    returnObject = Object.assign({}, returnObject, profile);
    returnObject.ids = dims.map(d => d.id).join();
    returnObject.dims = dims;
    returnObject.variables = variables;
    // The provided ids may have images associated with them, and these images have metadata. Before we send
    // The object, we need to make a request to our /api/image endpoint to get any relevant image data.
    // Note! Images are strictly ordered to match your strictly ordered slug/id pairs
    const images = [];
    for (const dim of dims) {
      const url = `${origin}/api/image?slug=${dim.slug}&id=${dim.id}&locale=${locale}&type=json`;
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

  // Endpoint for getting a story
  app.get("/api/story/:id", async(req, res) => {
    const {id} = req.params;
    const locale = req.query.locale ? req.query.locale : envLoc;
    // Using a Sequelize OR when the two OR columns are of different types causes a Sequelize error, necessitating this workaround.
    const reqObj = !isNaN(id) ? Object.assign({}, storyReq, {where: {id}}) : Object.assign({}, storyReq, {where: {slug: id}});
    let story = await db.story.findOne(reqObj).catch(catcher);
    if (!story) {
      if (verbose) console.error(`Story not found for id: ${id}`);
      return res.json({error: `Story not found for id: ${id}`});
    }
    story = sortStory(extractLocaleContent(story, locale, "story"));
    // varSwapRecursive takes any column named "logic" and transpiles it to es5 for IE.
    // Do a naive varswap (with no formatters and no variables) just to access the transpile for vizes.
    story = varSwapRecursive(story, {}, {});
    return res.json(story);
  });

  // Endpoint for getting all stories
  app.get("/api/story", async(req, res) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    let stories = await db.story.findAll({include: [
      {association: "content"},
      {association: "authors", include: [
        {association: "content", attributes: ["name", "image", "locale"]}
      ]}
    ]}).catch(catcher);
    stories = stories.map(story => extractLocaleContent(story, locale, "story"));
    return res.json(stories.sort(sorter));
  });

};
