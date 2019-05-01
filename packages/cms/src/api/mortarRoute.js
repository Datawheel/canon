const FUNC = require("../utils/FUNC"),
      PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
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
        {association: "selectors", separate: true}
      ]
    }]
};

const topicReq = [
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
  {association: "selectors", separate: true}
];

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
    if (verbose) console.error("Server-side Malformed Formatter encountered: ", e.message, `Formatter name: ${name}`);
    acc[name] = FUNC.parse({logic: "return \"N/A\";", vars: ["n"]}, acc, locale);
  }

  return acc;

}, {});

const sorter = (a, b) => a.ordering - b.ordering;

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. Eventually move it up to the query.
const sortProfile = profile => {
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

  app.get("/api/internalprofile/:slug", async(req, res) => {
    const {slug} = req.params;
    const locale = req.query.locale ? req.query.locale : envLoc;
    const reqObj = Object.assign({}, profileReq, {where: {slug}});
    const profile = await db.profile.findOne(reqObj).catch(catcher);
    return res.json(sortProfile(extractLocaleContent(profile, locale, "profile")));
  });

  app.get("/api/variables/:slug/:id", async(req, res) => {
  // app.get("/api/variables/:slug/:id", jsonCache, (req, res) => {
    const locale = req.query.locale ? req.query.locale : envLoc;
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    const {slug, id} = req.params;

    if (verbose) console.log("\n\nVariable Endpoint:", `/api/variables/${slug}/${id}`);

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

    // Begin by fetching the profile by slug, and all the generators that belong to that profile
    /* Potential TODO here: Later in this function we manually get generators and materializers.
     * Maybe refactor this to get them immediately in the profile get using include.
     */
    const profile = await db.profile.findOne({where: {slug}, raw: true}).catch(catcher);
    const pid = profile.id;
    const attr = await db.search.findOne({where: {[sequelize.Op.and]: [{id}, {hierarchy: {[sequelize.Op.in]: profile.levels}}]}}).catch(catcher);
    const formatters = await db.formatter.findAll().catch(catcher);
    const generators = await db.generator.findAll({where: {profile_id: profile.id}}).catch(catcher);
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

  /* Main API Route to fetch a profile, given a slug and an id
   * slugs represent the type of page (geo, naics, soc, cip, university)
   * ids represent actual entities / locations (nyc, bu)
  */

  app.get("/api/profile/:slug/:pid", async(req, res) => {
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    const {slug, pid} = req.params;
    const locale = req.query.locale || envLoc;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
    const localeString = `?locale=${locale}`;

    const attribute = await db.search.findOne({where: {[sequelize.Op.or]: {id: pid, slug: pid}}}).catch(catcher);
    const {id} = attribute;

    const variablesResp = await axios.get(`${origin}/api/variables/${slug}/${id}${localeString}`).catch(catcher);
    const variables = variablesResp.data;
    delete variables._genStatus;
    delete variables._matStatus;
    const formatters = await db.formatter.findAll().catch(catcher);
    const formatterFunctions = formatters4eval(formatters, locale);
    // Given the completely built returnVariables and all the formatters (formatters are global)
    // Get the raw, unswapped, user-authored profile itself and all its dependencies and prepare 
    // it to be formatted and regex replaced.
    // See profileReq above to see the sequelize formatting for fetching the entire profile
    const request = await axios.get(`${origin}/api/internalprofile/${slug}${localeString}`).catch(catcher);    
    // Given an object with completely built returnVariables, a hash array of formatter functions, and the profile itself
    // Go through the profile and replace all the provided {{vars}} with the actual variables we've built
    let returnObject = {};
    // Create a "post-processed" profile by swapping every {{var}} with a formatted variable
    if (verbose) console.log("Variables Loaded, starting varSwap...");
    const profile = varSwapRecursive(request.data, formatterFunctions, variables, req.query);
    returnObject = Object.assign({}, returnObject, profile);
    returnObject.id = id;
    returnObject.variables = variables;
    if (verbose) console.log("varSwap complete, sending json...");
    return res.json(returnObject);
  });

  // Endpoint for when a user selects a new dropdown for a topic, requiring new variables
  app.get("/api/topic/:slug/:pid/:topicId", async(req, res) => {
    req.setTimeout(1000 * 60 * 30); // 30 minute timeout for non-cached cube queries
    const {slug, pid, topicId} = req.params;
    const locale = req.query.locale || envLoc;
    const localeString = `?locale=${locale}`;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;

    const attribute = await db.search.findOne({where: {[sequelize.Op.or]: {id: pid, slug: pid}}}).catch(catcher);
    const {id} = attribute;

    // As with profiles above, we need formatters, variables, and the topic itself in order to
    // create a "postProcessed" topic that can be returned to the requester.
    const variablesResp = await axios.get(`${origin}/api/variables/${slug}/${id}${localeString}`).catch(catcher);
    const variables = variablesResp.data;
    delete variables._genStatus;
    delete variables._matStatus;
    const formatters = await db.formatter.findAll().catch(catcher);
    const formatterFunctions = formatters4eval(formatters, locale);

    const where = {};
    if (isNaN(parseInt(topicId, 10))) where.slug = topicId;
    else where.id = topicId;
    let topic = await db.topic.findOne({where, include: topicReq}).catch(catcher);      
    topic = extractLocaleContent(topic, locale, "topic");
    topic = varSwapRecursive(topic, formatterFunctions, variables, req.query);
    if (topic.subtitles) topic.subtitles.sort(sorter);
    if (topic.selectors) topic.selectors.sort(sorter);
    if (topic.stats) topic.stats.sort(sorter);
    if (topic.descriptions) topic.descriptions.sort(sorter);
    if (topic.visualizations) topic.visualizations.sort(sorter);
    return res.json({variables, ...topic});
  });

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
