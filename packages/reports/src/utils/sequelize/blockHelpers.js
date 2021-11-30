const axios = require("axios");
const varSwapRecursive = require("../varSwapRecursive");
const mortarEval = require("../mortarEval");
const jwt = require("jsonwebtoken");
const yn = require("yn");
const {BLOCK_FIELDS_EXCLUDE, BLOCK_TYPES} = require("../consts/cms");
const varSwap = require("../varSwap");

const LOCALE_DEFAULT = process.env.CANON_LANGUAGE_DEFAULT || "en";
const LOCALES = process.env.CANON_LANGUAGES || LOCALE_DEFAULT;
const LOGINS = process.env.CANON_LOGINS || false;
const PORT = process.env.CANON_PORT || 3300;
const NODE_ENV = process.env.NODE_ENV || "development";
const REQUESTS_PER_SECOND = process.env.CANON_CMS_REQUESTS_PER_SECOND ? parseInt(process.env.CANON_CMS_REQUESTS_PER_SECOND, 10) : 20;
const GENERATOR_TIMEOUT = process.env.CANON_CMS_GENERATOR_TIMEOUT ? parseInt(process.env.CANON_CMS_GENERATOR_TIMEOUT, 10) : 5000;
const CANON_CMS_CUBES = process.env.CANON_CMS_CUBES ? process.env.CANON_CMS_CUBES.replace(/\/$/, "") : "localhost";
const verbose = yn(process.env.CANON_CMS_LOGGING);

// Some canon vars are made available to the front end for URL construction and other advanced interactions
const canonVars = {
  CANON_API: process.env.CANON_API,
  CANON_LANGUAGES: LOCALES,
  CANON_LANGUAGE_DEFAULT: LOCALE_DEFAULT,
  CANON_LOGINS: LOGINS,
  CANON_LOGLOCALE: process.env.CANON_LOGLOCALE,
  CANON_LOGREDUX: process.env.CANON_LOGREDUX,
  CANON_PORT: PORT,
  NODE_ENV
};

const catcher = e => {
  if (verbose) console.error("Error in blockHelpers: ", e);
  return {};
};

// Use axios interceptors to time requests for CMS front-end warnings
axios.interceptors.request.use(d => {
  d.meta = d.meta || {};
  d.meta.requestStartedAt = new Date().getTime();
  return d;
});

axios.interceptors.response.use(d => {
  d.requestDuration = new Date().getTime() - d.config.meta.requestStartedAt;
  return d;
}, e => Promise.reject(e));

/**
 * If OLAP_PROXY_SECRET is provided, some cubes are locked down, and require special axios configs
 */
const getProxyConfig = (opt = {}) => {
  const {CANON_CMS_MINIMUM_ROLE, OLAP_PROXY_SECRET} = process.env;
  const config = {};
  if (OLAP_PROXY_SECRET) {
    const jwtPayload = {sub: "server", status: "valid"};
    if (CANON_CMS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_CMS_MINIMUM_ROLE;
    const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
    config.headers = {"x-tesseract-jwt-token": apiToken};
  }
  return {...config, ...opt};
};

// todo1.0 - the vars object is built like this: {...req.params, ...cache, ...attr, ...canonVars, locale}
// decide who is responsible for which parts - (e.g., should mortarRoute package req.params into vars for its calling of this function?)
/**
 * Make a request to the given api endpoint, swapping in all vars for anything between <brackets>, return the result
 */
const apiFetch = async(req, api, locale, vars) => {
  const origin = `${ req.protocol }://${ req.headers.host }`;
  // todo1.0 add formatters here
  let url = varSwap(api, {}, {...vars, ...canonVars, locale});
  if (url.indexOf("http") !== 0) {
    url = `${origin}${url.indexOf("/") === 0 ? "" : "/"}${url}`;
  }
  const config = getProxyConfig({timeout: GENERATOR_TIMEOUT});
  const resp = await axios.get(url, config).catch(e => {
    // todo1.0 - bubble up an error here like in translate
    if (verbose) console.log(`Variable Error for ${url}: ${e.message}`);
    return false;
  });
  if (resp) {
    if (verbose) console.log(`Variable loaded: ${url}`);
    return resp;
  }
  else {
    return {data: {}}; // todo1.0 error here
  }
};

/**
 * Given a list of all possible blocks, create a hash object, keyed by id,
 * where each entry contains the variables which that block exports. Requires a "rootBlocks"
 * entry point to determine starting blocks.
 */
const runConsumers = async(req, blocks, locale, formatterFunctions, rootBlocks) => {
  
  /**
   * Starting with rootBlocks, crawl down the list of consumers, storing the keyed results in downstreamResult.
   *
   * However, while working DOWN the tree, we may encounter a block whose inputs have not been calculated.
   * Consider A->B->C in conjunction with D->E->C. We start at A, work down to B, but then encounter C.
   * The values for D/E have not been calculated during this run and are unavailable. In that case, we must
   * crawl back up backwards, from C to E to D, until we hit another root with no inputs (D). While on our way down,
   * cache both downstreamResult AND upstreamResult, so we can use that cache instead of re-running. Ultimately,
   * this function returns downstreamResult - upstreamResult is just a cache/helper for that.
   */
  let upstreamResult = {};
  const downstreamResult = {};
  const statusById = {};
  // Calculate the vars/status for this block, given the variables from its inputs. Each var will be prepended with the
  // block type and id, which will create variables like "stat14value" for downstream blocks.
  const generateVars = async(block, variables = {}) => {
    let result = {};
    statusById[block.id] = {};
    // todo1.0, this will have api calls
    if (block.type === BLOCK_TYPES.GENERATOR) {
      // todo1.0, pass the correct vars here
      const resp = await apiFetch(req, block.api, locale, variables).catch(catcher);
      statusById[block.id].duration = resp.requestDuration;
      statusById[block.id].response = resp.data;
      const evalResults = mortarEval("resp", resp.data, block.logic, {}, locale); // todo1.0 add formatters here
      if (evalResults.error) statusById[block.id].error = evalResults.error;
      if (evalResults.log) statusById[block.id].log = evalResults.log;
      if (typeof evalResults.vars === "object") result = evalResults.vars;
    }
    else {
      // If the block has logic enabled, then the variables should be calculated by running the javascript in the logic key.
      if (block.contentByLocale[locale].content.logicEnabled) {
        const {logic} = block.contentByLocale[locale].content;
        const evalResults =  mortarEval("variables", variables, logic, {}, locale); // todo1.0 add formatters here
        if (evalResults.error) statusById[block.id].error = evalResults.error;
        if (evalResults.log) statusById[block.id].log = evalResults.log;
        if (typeof evalResults.vars === "object") result = Object.keys(evalResults.vars).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: evalResults.vars[d]}), {});
      }
      // If logic is not enabled, just varSwap the content keys and pass them downward.
      else {
        const contentObj = Object.keys(block.contentByLocale[locale].content)
        // Exclude fields like logic and logicEnabled, which though stored in the same content object, aren't used downstream.
          .filter(d => !BLOCK_FIELDS_EXCLUDE.includes(d))
          .reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: block.contentByLocale[locale].content[d]}), {});
        result = varSwapRecursive(contentObj, formatterFunctions, variables);
      }
    }
    return result;
  };

  // Given the id of a block with inputs, return a hash object keyed by the input ids, whose values
  // represent the variables those inputs provide. (Use cache as much as possible, recurse if necessary)
  const crawlUp = async bid => {
    const block = blocks[bid];
    if (block.inputs.length === 0) return {[block.id]: downstreamResult[block.id] || upstreamResult[block.id] || await generateVars(block)};
    let variables;
    for (const input of block.inputs) {
      variables = {...variables, ...upstreamResult[input] || await crawlUp(input)};
    }
    return variables;
  };

  // Given an id, set downstreamResult[id] to the variables which that id exports.
  const crawlDown = async bid => {
    let block, variables;
    // If this block has inputs, gather their results into an object and use it to help generate THIS block's variables.
    if (rootBlocks[bid]) {
      block = rootBlocks[bid];
      // A rootBlock may be a "true" root, one with no inputs, or a block somewhere in the chain that updated (and may have inputs)
      // If it has inputs, crawl upwards to calculate the necessary variables, caching the results in upstreamResult as we go.
      const variablesById = blocks[bid].inputs.length > 0 ? await crawlUp(bid) : {};
      upstreamResult = {...upstreamResult, ...variablesById};
      variables = Object.values(variablesById).reduce((acc, d) => ({...acc, ...d}), {});
    }
    else {
      block = blocks[bid];
      // If this block is not a root, then it should get its inputs from one two places:
      // 1. The live-building downstreamResult, meaning we visited this node on our way down.
      // 2. A previously run upstreamResult, cached from some other crawlUp
      // 2a. If there is no result in either downstream or upstream, run crawlUp to fill in the upstream.
      // todo1.0 deal with removals / undefined? like in original cms
      if (block.inputs.some(d => !downstreamResult[d] && !upstreamResult[d])) upstreamResult = {...upstreamResult, ...await crawlUp(bid)};
      for (const input of block.inputs) {
        variables = {...variables, ...downstreamResult[input] ? downstreamResult[input] : upstreamResult[input]};
      }
    }
    // rootBlock or otherwise, the variables that feed THIS BLOCK have now been calculated. Generate this block's output
    // using those variables, and store the result in the still-growing downstreamResult.
    downstreamResult[bid] = await generateVars(block, variables).catch(catcher);
    for (const cid of blocks[bid].consumers) {
      await crawlDown(cid);
    }
  };
  for (const id of Object.keys(rootBlocks)) {
    await crawlDown(id);
  }
  // todo1.0 ask ryan if i can combine upstream and downstream 
  return {variablesById: {...upstreamResult, ...downstreamResult}, statusById};
};

module.exports = {runConsumers};
