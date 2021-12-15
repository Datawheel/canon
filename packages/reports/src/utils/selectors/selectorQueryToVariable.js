const {SELECTOR_TYPES} = require("../consts/cms");

/**
 * Given a selector id, a query like selector29id=year2017,year2019, and a selector config,
 * extract the ids from the query and create a variable set for use downstream from the selector.
 * If it is a single selector, selector29id and selector29label will be strings.
 * If it is a multi selector, selector29id and selector29label will be arrays of strings.
 */
const selectorQueryToVariable = (id, query, config) => {
  const accessor = `selector${id}id`;
  const queryObject = new URLSearchParams(query);
  if (config.type === SELECTOR_TYPES.MULTI) {
    // query values are "string,lists" but the default is a real array.
    const queryIds = queryObject.get(accessor) ? queryObject.get(accessor).split(",") : config._default;
    const options = config.options.filter(d => queryIds.includes(d.id));
    return {
      [`selector${id}id`]: queryIds,
      [`selector${id}label`]: options.map(d => d.label)
    };
  }
  else { // single
    const queryId = queryObject.get(accessor) ? queryObject.get(accessor) : config._default;
    const option = config.options.find(d => d.id === queryId);
    return {
      [`selector${id}id`]: queryId,
      [`selector${id}label`]: option.label
    };

  }
};

module.exports = selectorQueryToVariable;
