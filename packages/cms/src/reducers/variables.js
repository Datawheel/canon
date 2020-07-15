const deepClone = require("../utils/deepClone");

export default (variables = {}, action) => {
  switch (action.type) {
    case "VARIABLES_SET": 
      return deepClone(action.data.variables);
    default: return variables;
  }
};
