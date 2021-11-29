export default (status = {}, action) => {

  const success = action && action.data && action.data.id ? {id: action.data.id, status: "SUCCESS"} : {};
  const error = action && action.data && action.data.id ? {id: action.data.id, status: "ERROR"} : {};

  switch (action.type) {
    // Basic assign
    case "STATUS_SET":
      return Object.assign({}, status, action.data);
    // Report loading completion of stories and profiles
    case "PROFILES_GET":
      return Object.assign({}, status, {profilesLoaded: true});
    case "FORMATTER_GET":
      return Object.assign({}, status, {formattersLoaded: true});
    // Creation Detection
    case "PROFILE_NEW":
      return Object.assign({}, status, {justCreated: {type: "profile", id: action.data.id}});
    case "PROFILE_DUPLICATE":
      return Object.assign({}, status, {justCreated: {type: "profile", id: action.data.id}});
    case "PROFILE_TRANSLATE":
      return Object.assign({}, status, {translationCounter: action.translationCounter});
    case "TRANSLATE_START":
      return Object.assign({}, status, {translationError: false});
    case "TRANSLATE_ERROR":
      return Object.assign({}, status, {translationCounter: action.translationCounter, translationError: action.error});
    case "SECTION_NEW":
      return Object.assign({}, status, {justCreated: {type: "section", id: action.data.id, profile_id: action.data.profile_id}});
    case "SECTION_DUPLICATE":
      return Object.assign({}, status, {justCreated: {type: "section", id: action.data.id, profile_id: action.data.profile_id}});
    case "FORMATTER_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "formatter", id: action.data.id, force: true}});
    // Updating a formatter means that some formatter logic changed. Bump the diffcounter.
    case "FORMATTER_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, diffCounter: action.diffCounter, justUpdated: {type: "formatter", ...success}});
    case "FORMATTER_DELETE":
      return Object.assign({}, status, {dialogOpen: false, diffCounter: action.diffCounter});
    case "VARIABLES_FETCH":
      return Object.assign({}, status, {fetchingVariables: action.data});
    case "VARIABLES_FETCHED":
      return Object.assign({}, status, {fetchingVariables: false});
    // Updating variables or saving a section or meta means that anything that depends on variables, such as TextCards
    // Or the tree, needs to know something changed. Instead of running an expensive stringify on variables,
    // Just increment a counter that the various cards can subscribe to.
    case "VARIABLES_DIFF":
      const newStatus = {};
      if (action.data.diffCounter) newStatus.diffCounter = action.data.diffCounter;
      return Object.assign({}, status, newStatus);
    // Updating sections could mean the title was updated. Bump a "diffcounter" that the Navbar tree can listen for to jigger a render
    case "SECTION_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, diffCounter: action.diffCounter, justUpdated: {type: "section", ...success}});
    // Section-wide translations update a ton of content in one go. This requires a massive TextCard-wide "jigger" to update their content
    case "SECTION_TRANSLATE":
      return Object.assign({}, status, {translationCounter: action.translationCounter});
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
    case "BLOCK_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "block", id: action.data.id, force: true}});
    case "BLOCK_DELETE":
      // todo1.0 this has to support generator deletes, which changes variables
      return Object.assign({}, status, {dialogOpen: false});
    // Update Events
    // When an update attempt starts, clear the justUpdated variable, which will then be refilled with SUCCESS or ERROR.
    // This is to ensure that subsequent error messages freshly fire, even if they are the "same" error
    case "CLEAR_UPDATED":
      return Object.assign({}, status, {justUpdated: false});
    // Note: some of the update event cases are written above
    case "PROFILE_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "profile", ...success}});
    case "PROFILE_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "profile", ...error}});
    case "SECTION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "section", ...error}});
    case "FORMATTER_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "formatter", ...error}});
    case "BLOCK_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "block", ...success}});
    case "BLOCK_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "block", ...error}});
    default: return status;
  }
};
