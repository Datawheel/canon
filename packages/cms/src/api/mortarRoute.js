const FUNC = require("../utils/FUNC"),
      PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      collate = require("../utils/collate"),
      libs = require("../utils/libs"), // leave this! needed for the variable functions
      mortarEval = require("../utils/mortarEval"),
      sequelize = require("sequelize"),
      urlSwap = require("../utils/urlSwap"),
      varSwapRecursive = require("../utils/varSwapRecursive"),
      yn = require("yn");

const verbose = yn(process.env.CANON_CMS_LOGGING);
const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";

const catcher = e => {
  if (verbose) console.error("Error in mortarRoute: ", e);
  return [];
};

const throttle = new PromiseThrottle({
  requestsPerSecond: 10,
  promiseImplementation: Promise
});

const profileReq = {
  include: [
    {association: "meta", separate: true},
    {association: "content", separate: true},
    {association: "topics", separate: true,
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
      association: "storytopics", separate: true,
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

const formatters4eval = (formatters, locale) => formatters.reduce((acc, f) => {

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

const sorter = (a, b) => a.ordering - b.ordering;

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. Eventually move it up to the query.
const sortProfile = profile => {
  profile.meta.sort(sorter);
  if (profile.topics) {
    profile.topics.sort(sorter);
    profile.topics.forEach(topic => {
      if (topic.subtitles) topic.subtitles.sort(sorter);
      if (topic.selectors) topic.selectors.sort(sorter);
      if (topic.stats) topic.stats.sort(sorter);
      if (topic.descriptions) topic.descriptions.sort(sorter);
      if (topic.visualizations) topic.visualizations.sort(sorter);
    });
  }
  return profile;
};

const sortStory = story => {
  ["descriptions", "footnotes", "authors", "storytopics"].forEach(type => story[type].sort(sorter));
  story.storytopics.forEach(storytopic => {
    ["descriptions", "stats", "subtitles", "visualizations"].forEach(type => storytopic[type].sort(sorter));
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
  const defCon = obj.content.find(c => c.lang === envLoc);
  const thisCon = obj.content.find(c => c.lang === locale);
  fieldSet.forEach(k => {
    if (k !== "id" && k !== "lang") {
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
    const children = mode === "story" ? "storytopics" : "topics";
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
  if (mode === "topic") {
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

  app.get("/api/variables/:pid", async(req, res) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    const dims = collate(req.query);
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    const {pid} = req.params;

    if (verbose) console.log("\n\nVariable Endpoint:", `/api/variables/${pid}`);

    /** */
    function createGeneratorFetch(r, attr) {
      // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
      let url = urlSwap(r, {...req.params, ...cache, ...attr, locale});
      if (url.indexOf("http") !== 0) {
        const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
        url = `${origin}${url.indexOf("/") === 0 ? "" : "/"}${url}`;
      }
      return axios.get(url)
        .then(resp => {
          if (verbose) console.log("Variable Loaded:", url);
          return resp;
        })
        .catch(() => {
          if (verbose) console.log("Variable Error:", url);
          return {};
        });
    }

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
      const thisSlug = profile.meta.find(d => d.slug === dim.slug);
      const levels = thisSlug ? thisSlug.levels : [];
      let searchReq;
      if (levels.length === 0) {
        searchReq = {where: {id: dim.id}};
      }
      else {
        searchReq = {where: {[sequelize.Op.and]: [{id: dim.id}, {hierarchy: {[sequelize.Op.in]: levels}}]}};
      }
      let thisAttr = await db.search.findOne(searchReq).catch(catcher);
      thisAttr = thisAttr ? thisAttr.toJSON() : {};
      if (i === 0) attr = Object.assign(attr, thisAttr);
      Object.keys(thisAttr).forEach(key => {
        attr[`${key}${i + 1}`] = thisAttr[key];
      });
    }
    
    const formatters = await db.formatter.findAll().catch(catcher);
    // Allow the user to specify a specific generator only via a query param
    const gid = req.query.generator;
    const genObj = gid ? {where: {id: gid}} : {where: {profile_id: profile.id}};
    const generators = await db.generator.findAll(genObj).catch(catcher);
    // Given a profile id and its generators, hit all the API endpoints they provide
    // Create a hash table so the formatters are directly accessible by name
    const formatterFunctions = formatters4eval(formatters, locale);
    // Deduplicate generators that share an API endpoint
    const requests = Array.from(new Set(generators.map(g => g.api)));
    const fetches = requests.map(r => throttle.add(createGeneratorFetch.bind(this, r, attr)));
    const results = await Promise.all(fetches).catch(catcher);
    // Given a profile id, its generators, their API endpoints, and the responses of those endpoints,
    // start to build a returnVariables object by executing the javascript of each generator on its data
    let returnVariables = {};
    const genStatus = {};
    results.forEach((r, i) => {
      // For every API result, find ONLY the generators that depend on this data
      const requiredGenerators = generators.filter(g => g.api === requests[i]);
      // Build the return object using a reducer, one generator at a time
      returnVariables = requiredGenerators.reduce((acc, g) => {
        const evalResults = mortarEval("resp", r.data, g.logic, formatterFunctions, locale);
        const {vars} = evalResults;
        // genStatus is used to track the status of each individual generator
        genStatus[g.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
        // Fold the generated variables into the accumulating returnVariables
        return {...returnVariables, ...vars};
      }, returnVariables);
    });
    returnVariables._genStatus = genStatus;
    const materializers = await db.materializer.findAll({where: {profile_id: pid}, raw: true}).catch(catcher);
    // Given the partially built returnVariables and all the materializers for this profile id,
    // Run the materializers and fold their generated variables into returnVariables     
    // The order of materializers matter because input to later materializers depends on output from earlier materializers
    materializers.sort((a, b) => a.ordering - b.ordering);
    const matStatus = {};
    returnVariables = materializers.reduce((acc, m) => {
      const evalResults = mortarEval("variables", acc, m.logic, formatterFunctions, locale);
      const {vars} = evalResults;
      matStatus[m.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
      return {...acc, ...vars};
    }, returnVariables);
    returnVariables._matStatus = matStatus;
    return res.json(returnVariables);
  });  

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
      const dim = dims[0];
      const attribute = await db.search.findOne({where: {[sequelize.Op.or]: {id: dim.id, slug: dim.id}}}).catch(catcher);
      if (attribute && attribute.id) dim.id = attribute.id;
    }

    const topicID = req.query.topic;
    const profileID = req.query.profile;

    let pid = null;
    // If the user provided variables, this is a POST request.
    if (req.body.variables) {
      // If the user gave us a topic or a profile id, use that to fetch the pid.
      if (topicID) {
        const where = isNaN(parseInt(topicID, 10)) ? {slug: topicID} : {id: topicID};
        const t = await db.topic.findOne({where}).catch(catcher);
        if (t) {
          pid = t.profile_id;
        } 
        else {
          if (verbose) console.error(`Profile not found for topic: ${topicID}`);
          return res.json(`Profile not found for topic: ${topicID}`);
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
      const pids = [...new Set(meta.map(d => d.profile_id))];
      const match = dims.map(d => d.slug).join();
      
      pids.forEach(id => {
        const rows = meta.filter(d => d.profile_id === id).sort((a, b) => a.ordering - b.ordering);
        const str = rows.map(d => d.slug).join();
        if (str === match) pid = rows[0].profile_id;
      });
      if (!pid) { 
        if (verbose) console.error(`Profile not found for slugs: ${match}`);
        return res.json(`Profile not found for slugs: ${match}`);
      }
    }

    let variables = {};
    // If the user has provided variables, this is a POST request. Use those variables,
    // And skip the entire variable fetching process.
    if (req.body.variables) {
      variables = req.body.variables;
    }
    // If the user has not provided variables, this is a GET request. Run Generators.
    else {
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

    const formatters = await db.formatter.findAll().catch(catcher);
    const formatterFunctions = formatters4eval(formatters, locale);
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
    let returnObject = {};
    // Create a "post-processed" profile by swapping every {{var}} with a formatted variable
    if (verbose) console.log("Variables Loaded, starting varSwap...");
    let profile = request.data;
    // Each topic will require references to all selectors
    let allSelectors = await db.selector.findAll({where: {profile_id: profile.id}}).catch(catcher);
    allSelectors = allSelectors.map(as => as.toJSON());
    profile.selectors = allSelectors;
    profile = varSwapRecursive(profile, formatterFunctions, variables, req.query);
    // If the user provided selectors in the query, then the user has changed a dropdown.
    // This means that OTHER dropdowns on the page need to be set to match. To accomplish 
    // this, hijack the "default" property on any matching selector so the dropdowns "start"
    // where we want them to.
    profile.topics.forEach(topic => {
      topic.selectors.forEach(selector => {
        const {name} = selector;
        // If the user provided a selector in the query, AND if it's actually an option
        if (req.query[name] && selector.options.map(o => o.option).includes(req.query[name])) {
          selector.default = req.query[name];
        }
      });
    });
    // If the user provided a topic ID in the query, that's all they want. Find & Return just that.
    if (topicID) {
      const topic = profile.topics.find(t => Number(t.id) === Number(topicID) || t.slug === topicID);
      returnObject = Object.assign({}, returnObject, topic);
    }
    // Otherwise, it's just a top-level profile request
    else {
      returnObject = Object.assign({}, returnObject, profile);
    }
    returnObject.ids = dims.map(d => d.id).join();
    returnObject.variables = variables;
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
        {association: "content", attributes: ["name", "image", "lang"]}
      ]}
    ]}).catch(catcher);
    stories = stories.map(story => extractLocaleContent(story, locale, "story"));
    return res.json(stories.sort(sorter));
  });

};
