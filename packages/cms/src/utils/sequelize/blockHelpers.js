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
 * Given a list of blocks (usually constrained to a section), create a hash object, keyed by id,
 * where each entry contains the variables which that block exports. Optionally, provide a "startBlocks"
 * entry point to only calculate those blocks and their children.
 */
const runConsumers = (blocks, locale, formatterFunctions, startBlocks) => {
  // If not given startBlocks, find the root blocks, i.e., blocks with no inputs.
  if (!startBlocks) {
    startBlocks = Object.values(blocks).filter(d => d.inputs.length === 0).reduce((acc, d) => ({...acc, [d.id]: d}), {});
  }
  const result = {};
  // Calculate the vars for this block, given the variables from its inputs. Each var will be prepended with the
  // block type and id, which will create variables like "stat14value" for downstream blocks.
  const generateVars = (block, variables = {}) => {
    let result;
    // todo1.0, this will have api calls
    // If the block has logic enabled, then the variables should be calculated by running the javascript in the logic key.
    if (block.contentByLocale[locale].content.logicEnabled) {
      const vars = {};
      const {logic} = block.contentByLocale[locale].content;
      const evalResults = mortarEval("variables", vars, logic, {}, locale); // todo1.0 add formatters here
      if (typeof evalResults.vars !== "object") evalResults.vars = {};
      // block._status = evalResults.error ? {error: evalResults.error} : "OK";
      result = Object.keys(evalResults.vars).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: evalResults.vars[d]}), {});
    }
    // If logic is not enabled, just varSwap the content keys and pass them downward.
    else {
      const contentObj = Object.keys(block.contentByLocale[locale].content)
        // Exclude fields like logic and logicEnabled, which though stored in the same content object, aren't used downstream.
        .filter(d => !BLOCK_FIELDS_EXCLUDE.includes(d))
        .reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: block.contentByLocale[locale].content[d]}), {});
      result = varSwapRecursive(contentObj, formatterFunctions, variables);
    }
    return result;
  };
  // Given an id, set result[id] to the variables that this block creates.
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
