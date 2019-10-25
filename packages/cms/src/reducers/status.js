const deepClone = require("../utils/deepClone");

export default (status = {}, action) => {
  switch (action.type) {
    case "STATUS_SET": 
      return Object.assign({}, status, action.data);
    case "VARIABLES_SET": 
      const newStatus = {variables: deepClone(action.data.variables)};
      if (action.data.diffCounter) newStatus.diffCounter = action.data.diffCounter;
      return Object.assign({}, status, newStatus);
    case "GENERATOR_NEW": 
      return Object.assign({}, status, {forceID: action.data.id, forceType: "generator", forceOpen: true});
    case "GENERATOR_UPDATE": 
      return Object.assign({}, status, {forceID: false, forceType: false, forceOpen: false});
    case "MATERIALIZER_NEW": 
      return Object.assign({}, status, {forceID: action.data.id, forceType: "materializer", forceOpen: true});
    case "MATERIALIZER_UPDATE": 
      return Object.assign({}, status, {forceID: false, forceType: false, forceOpen: false});
    case "SECTION_UPDATE": 
      return Object.assign({}, status, {diffCounter: action.diffCounter});
    default: return status;
  }
};
