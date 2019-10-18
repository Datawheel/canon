const deepClone = require("../utils/deepClone");

export default (status = {}, action) => {
  switch (action.type) {
    case "STATUS_SET": 
      return Object.assign({}, status, action.data);
    case "VARIABLES_SET": 
      return Object.assign({}, status, {variables: deepClone(action.data.variables)});
    default: return status;
  }
};
