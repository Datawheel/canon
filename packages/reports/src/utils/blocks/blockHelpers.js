const axios = require("axios");
const mortarEval = require("../variables/mortarEval");
const jwt = require("jsonwebtoken");
const yn = require("yn");
const {BLOCK_FIELDS_EXCLUDE, BLOCK_TYPES} = require("../consts/cms");
const varSwap = require("../variables/varSwap");
const varSwapRecursive = require("../variables/varSwapRecursive");
const runSelector = require("../selectors/runSelector");
const selectorQueryToVariable = require("../selectors/selectorQueryToVariable");

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
const runConsumers = async(req, attributes, blocks, locale, formatterFunctions, rootBlocks) => {

  /**
   * Starting with rootBlocks, crawl down the list of consumers, storing the keyed results in downstreamResult.
   *
   * However, while working DOWN the tree, we may encounter a block whose inputs have not been calculated.
   * Consider A->B->C in conjunction with D->E->C. We start at A, work down to B, but then encounter C.
   * The values for D/E have not been calculated during this run and are unavailable. In that case, we must
   * crawl back up backwards, from C to E to D, until we hit another root with no inputs (D). While on our way
   * up or down, cache results so we can use that cache instead of re-running.
   */
  const cache = {};
  const statusById = {};
  // Calculate the vars/status for this block, given the variables from its inputs. Each var will be prepended with the
  // block type and id, which will create variables like "stat14value" for downstream blocks.
  const generateVars = async(block, variables = {}) => {
    let result = {};
    variables = {...variables, ...attributes};
    statusById[block.id] = {};
    const setStatus = obj => statusById[block.id] = {...statusById[block.id], ...obj};
    if (block.type === BLOCK_TYPES.GENERATOR) {
      // todo1.0, pass the correct vars here, including canonVars, etc
      let data = {};
      if (block.content.api) {
        const resp = await apiFetch(req, block.content.api, locale, variables).catch(catcher);
        setStatus({duration: resp.requestDuration, response: resp.data});
        data = resp.data;
      }
      const evalResults = mortarEval("resp", data, block.content.logic, {}, locale, variables); // todo1.0 add formatters here
      const {vars, error, log} = evalResults;
      setStatus({error, log});
      if (typeof vars === "object") result = vars;
    }
    // If this block is a selector, then it should export *its currently selected option*
    else if (block.type === BLOCK_TYPES.SELECTOR) {
      const {config, log, error} = runSelector(block.contentByLocale[locale].content.logic, variables, locale);
      setStatus({error, log});
      result = selectorQueryToVariable(block.id, req.query.query, config);
    }
    else {
      const swappedLogic = varSwap(block.contentByLocale[locale].content.logic, formatterFunctions, variables);
      const evalResults = mortarEval("variables", variables, swappedLogic, {}, locale); // todo1.0 add formatters here
      const {vars, error, log} = evalResults;
      setStatus({error, log});
      if (typeof vars === "object") result = Object.keys(vars).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: vars[d]}), {});
    }
    return result;
  };

  // Given the id of a block with inputs, fill the cache with objects keyed by the input ids, whose values
  // represent the variables those inputs provide. (Use cache as much as possible, recurse if necessary)
  const crawlUp = async bid => {
    const block = blocks[bid];
    if (block.inputs.length === 0) {
      if (!cache[bid]) cache[bid] = await generateVars(block);
      return;
    }
    for (const input of block.inputs) {
      if (!cache[input]) await crawlUp(input);
    }
    const variables = block.inputs.reduce((acc, d) => ({...acc, ...cache[d]}), {});
    if (!cache[bid]) await generateVars(block, variables);
  };

  // Given an id, set cache[id] to the variables which that id exports.
  const crawlDown = async(bid, cascader) => {
    if (cascader) {
      cache[bid] = {};
      statusById[bid] = {hiddenByCascade: cascader};
      for (const cid of blocks[bid].consumers) {
        await crawlDown(cid, cascader);
      }
      return;
    }
    let block;
    let variables = {};
    // If this block has inputs, gather their results into an object and use it to help generate THIS block's variables.
    if (rootBlocks[bid]) {
      block = rootBlocks[bid];
      // A rootBlock may be a "true" root, one with no inputs, or a block somewhere in the chain that updated (and may have inputs)
      // If it has inputs, crawl upwards to calculate the necessary variables, caching the results as we go.
      if (blocks[bid].inputs.length > 0) {
        await crawlUp(bid);
        variables = block.inputs.reduce((acc, d) => ({...acc, ...cache[d]}), {});
      }
    }
    else {
      block = blocks[bid];
      // If this block is not a root, then it should get its inputs from one two places:
      // 1. The cache, from a previous up/down run
      // 2. If some aren't cached, go back and run them
      // todo1.0 deal with removals / undefined? like in original cms
      if (block.inputs.some(d => !cache[d])) await crawlUp(bid);
      variables = block.inputs.reduce((acc, d) => ({...acc, ...cache[d]}), {});
    }
    // rootBlock or otherwise, the variables that feed THIS BLOCK have now been calculated. Generate this block's output
    // using those variables, and store the result in the cache. First, however, using those vars, determine if this block
    // is allowed. If it isn't, cascade that hiding all the way down through its consumers.
    const allowed = !("allowed" in block.settings) || {...variables, ...attributes}[block.settings.allowed] || block.settings.allowed === "always";
    if (allowed) {
      if (!cache[bid]) cache[bid] = await generateVars(block, variables).catch(catcher);
      for (const cid of blocks[bid].consumers) {
        await crawlDown(cid);
      }
    }
    else {
      cache[bid] = {};
      statusById[bid] = {hiddenByCascade: bid};
      for (const cid of blocks[bid].consumers) {
        await crawlDown(cid, bid);
      }
    }
  };
  for (const id of Object.keys(rootBlocks)) {
    await crawlDown(id);
  }
  return {variablesById: cache, statusById};
};

module.exports = {runConsumers};
