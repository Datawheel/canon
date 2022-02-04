const {SELECTOR_TYPES} = require("../consts/cms");

/**
 * Determines if the provided value(s) are all valid options
 */
module.exports = (type, value, options) => {
  if (!options) return false;
  if (type === SELECTOR_TYPES.SINGLE) {
    return options.find(obj => obj.id === value);
  }
  else { // multi
    return Array.isArray(value) && value.every(d => options.map(o => o.id).includes(d));
  }    
};
