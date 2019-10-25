const deepClone = require("../utils/deepClone");

export default (status = {}, action) => {
  switch (action.type) {
    // Basic assign
    case "STATUS_SET": 
      return Object.assign({}, status, action.data);
    // When gens/mats are added, force them open for editing. When they are updated, close them.
    case "GENERATOR_NEW": 
      return Object.assign({}, status, {forceID: action.data.id, forceType: "generator", forceOpen: true});
    case "GENERATOR_UPDATE": 
      return Object.assign({}, status, {forceID: false, forceType: false, forceOpen: false});
    case "MATERIALIZER_NEW": 
      return Object.assign({}, status, {forceID: action.data.id, forceType: "materializer", forceOpen: true});
    case "MATERIALIZER_UPDATE": 
      return Object.assign({}, status, {forceID: false, forceType: false, forceOpen: false});
    // Updating variables or saving a section or meta means that anything that depends on variables, such as TextCards 
    // Or the tree, needs to know something changed. Instead of running an expensive stringify on variables,
    // Just increment a counter that the various cards can subscribe to.
    case "VARIABLES_SET": 
      const newStatus = {variables: deepClone(action.data.variables)};
      if (action.data.diffCounter) newStatus.diffCounter = action.data.diffCounter;
      return Object.assign({}, status, newStatus);
    case "SECTION_UPDATE": 
      return Object.assign({}, status, {diffCounter: action.diffCounter});
    case "DIMENSION_MODIFY": 
      return Object.assign({}, status, {diffCounter: action.diffCounter});
    case "DIMENSION_DELETE": 
      return Object.assign({}, status, {diffCounter: action.diffCounter});
    // Deleting a profile requires resetting currentNode/Pid. It will be reset when the jsx picks a new node automatically
    case "PROFILE_DELETE": 
      return Object.assign({}, status, {currentNode: false, currentPid: false});
    default: return status;
  }
};
