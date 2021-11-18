const {blockReqFull} = require("./ormHelpers");
const varSwapRecursive = require("../varSwapRecursive");
const formatters4eval = require("../formatters4eval");
const yn = require("yn");

const verbose = yn(process.env.CANON_CMS_LOGGING);

const catcher = e => {
  if (verbose) console.error("Error in blockHelpers: ", e);
  return [];
};

const contentReducer = (acc, d) => ({...acc, [d.locale]: d});

/**
 * Run a single block. This requires running all of its parent blocks until an input-less block is reached,
 * then feeding those inputs back down until this block can be run with the appropriate inputs.
 */
const runBlock = async(db, id, locale) => {
  // Retrieve the block in order to determine its section
  const block = await db.block.findOne({where: {id}}).catch(catcher);
  const section = block.section_id;
  const formatterFunctions = await formatters4eval(db, locale);
  // The recursion will need access to a number of other blocks - get a flat list here to avoid multiple db lookups
  let blocks = await db.block.findAll({...blockReqFull, where: {section_id: section}}).catch(catcher);
  blocks = blocks.map(d => {
    d = d.toJSON();
    return {...d, contentByLocale: d.contentByLocale.reduce(contentReducer, {})};
  });
  // Create the automatic content-driven keys that come from blocks (e.g., stat7title),
  // but calculate their values using variables from previously run inputs to this block.
  // todo1.0 - encaspulate this "content-driven" generator into a shared function
  const generateVars = (block, variables = {}) => {
    const contentObj = Object.keys(block.contentByLocale[locale].content).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: block.contentByLocale[locale].content[d]}), {});
    const result = varSwapRecursive(contentObj, formatterFunctions, variables);
    return result;
  };
  // Recursive function - given an id, crawl up all inputs, running generateVars on the way down.
  // For a given id, this function returns the variables which *that block creates*
  const getVars = id => {
    // Retrieve the block from the flat list (avoiding db lookup)
    const block = blocks.find(d => d.id === id);
    // If this block has no inputs, there is no need to crawl higher
    if (block.inputs.length === 0) {
      // Just process this object and pass its variables down
      return generateVars(block);
    }
    // If this block has inputs, gather their results into an object and use it to help generate THIS block's variables.
    const variables = block.inputs.reduce((acc, d) => ({...acc, ...getVars(d.id)}), {});
    return generateVars(block, variables);
  };
  return getVars(id);
};


/**
 * When a block is updated in the CMS, all its downstream consumers must have their variables recalculated.
 * This function returns a hash object, keyed by the id of ALL downstream consumers, with each value containing
 * the new variables that they, in turn, output. In redux, these are spread into the blocks in the reducer.
 */
const runConsumers = (updatedBlock, blocks, locale, formatterFunctions) => {
  const result = {};
  // Create the automatic content-driven keys that come from blocks (e.g., stat7title),
  // but calculate their values using variables from previously run inputs to this block.
  // todo1.0 - encaspulate this "content-driven" generator into a shared function
  const generateVars = (block, variables = {}) => {
    const contentObj = Object.keys(block.contentByLocale[locale].content).reduce((acc, d) => ({...acc, [`${block.type}${block.id}${d}`]: block.contentByLocale[locale].content[d]}), {});
    // todo1.0, this will have api calls
    const result = varSwapRecursive(contentObj, formatterFunctions, variables);
    return result;
  };
  const crawl = bid => {
    let block, variables;
    // If this block has inputs, gather their results into an object and use it to help generate THIS block's variables.
    if (bid === updatedBlock.id) {
      block = updatedBlock;
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
  crawl(updatedBlock.id);
  return result;
};

module.exports = {runBlock, runConsumers};
