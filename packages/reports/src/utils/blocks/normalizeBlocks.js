const contentReducer = require("./contentReducer");

/**
 * When blocks are loaded from the database, they have a hierarachical shape and an array of locale content.
 * The runConsumers function requires blocks to be in a normalized shape, this function prepares them.
 * @param {*} blocks 
 */
module.exports = blocks => blocks.map(d => ({...d,
  contentByLocale: d.contentByLocale.reduce(contentReducer, {}),
  inputs: d.inputs.map(d => d.id),
  consumers: d.consumers.map(d => d.id)
})).reduce((acc, d) => ({...acc, [d.id]: d}), {});
