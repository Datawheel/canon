const deepClone = require("../utils/deepClone");
// const {isObject} = require("d3plus-common");

/* In Progress here: determining what variables are used by a profile.
/*
const extractVariables = (obj, variablesUsed = []) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "string") {
      const matches = [];
      const re = new RegExp(/\{\{([^\}]+)\}\}/g);
      let match = re.exec(obj[key]);
      while (match !== null) {
        match = re.exec(obj[key]);
        if (match) matches.push(match[1]);
      }
      if (matches.length > 0) {
        matches.forEach(match => {
          if (!variablesUsed.includes(match)) variablesUsed.push(match);
        });
      }
    }
    else if (isObject(obj[key])) {
      return extractVariables(obj[key], variablesUsed);
    }
    else if (Array.isArray(obj[key])) {
      return obj[key].map(d => extractVariables(d, variablesUsed));
    }
    else {
      return 
    }
  });
  return variablesUsed;
};
*/

export default (status = {}, action) => {
  switch (action.type) {
    // Basic assign
    case "STATUS_SET": 
      return Object.assign({}, status, action.data);
    case "PROFILES_GET":
      return Object.assign({}, status, {profilesLoaded: true});
    case "STORIES_GET":
      return Object.assign({}, status, {storiesLoaded: true});
    // When toolbox items are added, force them open for editing. When they are updated, close them.
    case "GENERATOR_NEW": 
      return Object.assign({}, status, {toolboxDialogOpen: true, forceID: action.data.id, forceType: "generator", forceOpen: true});
    case "GENERATOR_UPDATE": 
      return Object.assign({}, status, {toolboxDialogOpen: false, forceID: false, forceType: false, forceOpen: false});
    case "MATERIALIZER_NEW": 
      return Object.assign({}, status, {toolboxDialogOpen: true, forceID: action.data.id, forceType: "materializer", forceOpen: true});
    case "MATERIALIZER_UPDATE": 
      return Object.assign({}, status, {toolboxDialogOpen: false, forceID: false, forceType: false, forceOpen: false});
    case "SELECTOR_NEW": 
      return Object.assign({}, status, {toolboxDialogOpen: true, forceID: action.data.id, forceType: "selector", forceOpen: true});
    case "SELECTOR_UPDATE": 
      return Object.assign({}, status, {toolboxDialogOpen: false, forceID: false, forceType: false, forceOpen: false});
    case "FORMATTER_NEW": 
      return Object.assign({}, status, {toolboxDialogOpen: true, forceID: action.data.id, forceType: "formatter", forceOpen: true});
    case "FORMATTER_UPDATE": 
      return Object.assign({}, status, {toolboxDialogOpen: false, forceID: false, forceType: false, forceOpen: false});
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
