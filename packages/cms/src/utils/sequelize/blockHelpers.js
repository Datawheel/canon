const axios = require("axios");
const varSwapRecursive = require("../varSwapRecursive");
const mortarEval = require("../mortarEval");
const jwt = require("jsonwebtoken");
const yn = require("yn");
const {BLOCK_FIELDS_EXCLUDE, BLOCK_TYPES} = require("../consts/cms");
const urlSwap = require("../urlSwap");

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

// If OLAP_PROXY_SECRET is provided, some cubes are locked down, and require special axios configs
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
const apiFetch = async(req, api, locale, vars) => {
  const origin = `${ req.protocol }://${ req.headers.host }`;
  let url = urlSwap(api, {...vars, ...canonVars, locale});
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
 * Given a list of blocks (usually constrained to a section), create a hash object, keyed by id,
 * where each entry contains the variables which that block exports. Optionally, provide a "startBlocks"
 * entry point to only calculate those blocks and their children.
 */
const runConsumers = async(req, blocks, locale, formatterFunctions, startBlocks) => {
  // If not given startBlocks, find the root blocks, i.e., blocks with no inputs.
  if (!startBlocks) {
    startBlocks = Object.values(blocks).filter(d => d.inputs.length === 0).reduce((acc, d) => ({...acc, [d.id]: d}), {});
  }
  const result = {};
  // Calculate the vars for this block, given the variables from its inputs. Each var will be prepended with the
  // block type and id, which will create variables like "stat14value" for downstream blocks.
  const generateVars = async(block, variables = {}) => {
    let result;
    // todo1.0, this will have api calls
    if (block.type === BLOCK_TYPES.GENERATOR) {
      // todo1.0, pass the correct vars here
      const resp = await apiFetch(req, block.api, locale, variables).then(d => d.data).catch(catcher);
      const evalResults = mortarEval("resp", resp, block.logic, {}, locale); // todo1.0 add formatters here
      result = typeof evalResults.vars === "object" ? evalResults.vars : {};
    }
    else {
      // If the block has logic enabled, then the variables should be calculated by running the javascript in the logic key.
      if (block.contentByLocale[locale].content.logicEnabled) {
        const {logic} = block.contentByLocale[locale].content;
        const evalResults =  mortarEval("variables", variables, logic, {}, locale); // todo1.0 add formatters here
        result = typeof evalResults.vars === "object" ? Object.keys(evalResults.vars).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: evalResults.vars[d]}), {}) : {};
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
  // Given an id, set result[id] to the variables that this block creates.
  const crawl = async bid => {
    let block, variables;
    // If this block has inputs, gather their results into an object and use it to help generate THIS block's variables.
    if (startBlocks[bid]) {
      block = startBlocks[bid];
      // At the head of the crawl, get the inputs from precalculated saved inputs (already in tree, unchanged)
      // Note that this lookup uses the *old* block in redux, as that's the one that has inputs. The updatedBlock is the lone
      // block from the server, and though that block is needed for generateVars (content-wise), it has no inputs.
      variables = blocks[bid].inputs.reduce((acc, d) => ({...acc, ...blocks[d]._variables}), {});
    }
    else {
      block = blocks[bid];
      // Otherwise, get them from the result that we are *building live* while going down the tree.
      // If the input node has been tread before, then it was recalculated, and the variable should come from there
      // Otherwise, it was not recalculated, and simply needs to be fetched from its saved variables.
      // todo1.0 deal with removals / undefined? like in original cms
      variables = block.inputs.reduce((acc, d) => ({...acc, ...result[d] ? result[d] : blocks[d]._variables}), {});
    }
    result[bid] = await generateVars(block, variables).catch(catcher);
    for (const cid of blocks[bid].consumers) {
      await crawl(cid);
    }
  };
  for (const id of Object.keys(startBlocks)) {
    await crawl(id);
  }
  return result;
};

module.exports = {runConsumers};
