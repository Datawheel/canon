// const {blockReqFull} = require("./ormHelpers");
const varSwapRecursive = require("../varSwapRecursive");
const mortarEval = require("../mortarEval");
const yn = require("yn");
const {BLOCK_FIELDS_EXCLUDE} = require("../consts/cms");

const verbose = yn(process.env.CANON_CMS_LOGGING);

const catcher = e => {
  if (verbose) console.error("Error in blockHelpers: ", e);
  return [];
};

/**
 * When a block is updated in the CMS, all its downstream consumers must have their variables recalculated.
 * This function returns a hash object, keyed by the id of ALL downstream consumers, with each value containing
 * the new variables that they, in turn, output. In redux, these are spread into the blocks in the reducer.
 */
const runConsumers = (blocks, locale, formatterFunctions, startBlocks) => {
  if (!startBlocks) {
    startBlocks = Object.values(blocks).filter(d => d.inputs.length === 0).reduce((acc, d) => ({...acc, [d.id]: d}), {});
  }
  const result = {};
  // Create the automatic content-driven keys that come from blocks (e.g., stat7title),
  // but calculate their values using variables from previously run inputs to this block.
  // todo1.0 - encaspulate this "content-driven" generator into a shared function
  const generateVars = (block, variables = {}) => {
    let result;
    // todo1.0, this will have api calls
    if (block.contentByLocale[locale].content.logicEnabled) {
      const vars = {};
      const {logic} = block.contentByLocale[locale].content;
      const evalResults = mortarEval("variables", vars, logic, {}, locale); // todo1.0 add formatters here
      if (typeof evalResults.vars !== "object") evalResults.vars = {};
      // block._status = evalResults.error ? {error: evalResults.error} : "OK";
      result = Object.keys(evalResults.vars).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: evalResults.vars[d]}), {});
    }
    else {
      const contentObj = Object.keys(block.contentByLocale[locale].content)
        .filter(d => !BLOCK_FIELDS_EXCLUDE.includes(d))
        .reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: block.contentByLocale[locale].content[d]}), {});
      result = varSwapRecursive(contentObj, formatterFunctions, variables);
    }
    return result;
  };
  const crawl = bid => {
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
    result[bid] = generateVars(block, variables);
    for (const cid of blocks[bid].consumers) {
      crawl(cid);
    }
  };
  for (const id of Object.keys(startBlocks)) {
    crawl(id);
  }
  return result;
};

module.exports = {runConsumers};
