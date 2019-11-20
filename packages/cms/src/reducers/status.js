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
    // Report loading completion of stories and profiles
    case "PROFILES_GET":
      return Object.assign({}, status, {profilesLoaded: true});
    case "STORIES_GET":
      return Object.assign({}, status, {storiesLoaded: true});
    case "FORMATTER_GET":
      return Object.assign({}, status, {formattersLoaded: true});
    // Creation Detection
    case "PROFILE_NEW": 
      return Object.assign({}, status, {justCreated: {type: "profile", id: action.data.id}});
    case "SECTION_NEW": 
      return Object.assign({}, status, {justCreated: {type: "section", id: action.data.id, profile_id: action.data.profile_id}});
    case "STORY_NEW": 
      return Object.assign({}, status, {justCreated: {type: "story", id: action.data.id}});
    case "STORYSECTION_NEW": 
      return Object.assign({}, status, {justCreated: {type: "storysection", id: action.data.id, story_id: action.data.story_id}});
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
    // Updating sections could mean the title was updated. Bump a "diffcounter" that the Navbar tree can listen for to jigger a render
    case "SECTION_UPDATE": 
      return Object.assign({}, status, {diffCounter: action.diffCounter});
    // When the user adds a new dimension, set a status that we are waiting for members to finish populating
    case "SEARCH_LOADING": 
      return Object.assign({}, status, {searchLoading: true});
    // When the dimension modify returns, 
    case "DIMENSION_MODIFY": 
      return Object.assign({}, status, {diffCounter: action.diffCounter, searchLoading: false});
    case "DIMENSION_DELETE": 
      return Object.assign({}, status, {diffCounter: action.diffCounter});
    // Deleting a profile requires resetting currentNode/Pid. It will be reset when the jsx picks a new node automatically
    // We need to set justDeleted so that the NavBar can listen for disappearing nodes, and automatically open a new one.
    case "PROFILE_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "profile", id: action.data.id}, currentPid: false});
    case "SECTION_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "section", id: action.data.id, parent_id: action.data.parent_id}});
    case "GENERATOR_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "generator", id: action.data.id, parent_id: action.data.parent_id}});
    case "MATERIALIZER_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "materializer", id: action.data.id, parent_id: action.data.parent_id}});
    case "STORY_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "story", id: action.data.id}, currentStoryPid: false});
    case "STORYSECTION_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "storysection", id: action.data.id, parent_id: action.data.parent_id}});
    default: return status;
  }
};
