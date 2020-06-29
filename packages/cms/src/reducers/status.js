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
    case "STORIES_GET":
      return Object.assign({}, status, {storiesLoaded: true});
    case "FORMATTER_GET":
      return Object.assign({}, status, {formattersLoaded: true});
    // Creation Detection
    case "PROFILE_NEW": 
      return Object.assign({}, status, {justCreated: {type: "profile", id: action.data.id}});
    case "PROFILE_DUPLICATE": 
      return Object.assign({}, status, {justCreated: {type: "profile", id: action.data.id}});
    case "SECTION_NEW": 
      return Object.assign({}, status, {justCreated: {type: "section", id: action.data.id, profile_id: action.data.profile_id}});
    case "SECTION_DUPLICATE": 
      return Object.assign({}, status, {justCreated: {type: "section", id: action.data.id, profile_id: action.data.profile_id}});
    case "STORY_NEW": 
      return Object.assign({}, status, {justCreated: {type: "story", id: action.data.id}});
    case "STORYSECTION_NEW": 
      return Object.assign({}, status, {justCreated: {type: "storysection", id: action.data.id, story_id: action.data.story_id}});
    // When toolbox items are added, force them open for editing. When they are updated, close them.
    case "GENERATOR_NEW": 
      return Object.assign({}, status, {dialogOpen: {type: "generator", id: action.data.id, force: true}});
    case "GENERATOR_DUPLICATE": 
      return Object.assign({}, status, {dialogOpen: {type: "generator", id: action.data.id, force: true}});
    case "GENERATOR_UPDATE": 
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "generator", ...success}});
    case "MATERIALIZER_NEW": 
      return Object.assign({}, status, {dialogOpen: {type: "materializer", id: action.data.id, force: true}});
    case "MATERIALIZER_DUPLICATE": 
      return Object.assign({}, status, {dialogOpen: {type: "materializer", id: action.data.id, force: true}});
    case "MATERIALIZER_UPDATE": 
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "materializer", ...success}});
    case "SELECTOR_NEW": 
      return Object.assign({}, status, {dialogOpen: {type: "selector", id: action.data.id, force: true}});
    case "SELECTOR_DUPLICATE": 
      return Object.assign({}, status, {dialogOpen: {type: "selector", id: action.data.id, force: true}});
    case "SELECTOR_UPDATE": 
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "selector", ...success}});
    case "SELECTOR_DELETE": 
      return Object.assign({}, status, {dialogOpen: false});
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
    // When the user adds a new dimension, set a status that we are waiting for members to finish populating
    case "STORYSECTION_UPDATE": 
      return Object.assign({}, status, {dialogOpen: false, diffCounter: action.diffCounter, justUpdated: {type: "storysection", ...success}});
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
      return Object.assign({}, status, {
        justDeleted: {type: "generator", id: action.data.id, parent_id: action.data.parent_id},
        dialogOpen: false
      });
    case "MATERIALIZER_DELETE": 
      return Object.assign({}, status, {
        justDeleted: {type: "materializer", id: action.data.id, parent_id: action.data.parent_id},
        dialogOpen: false
      });
    case "STORY_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "story", id: action.data.id}, currentStoryPid: false});
    case "STORYSECTION_DELETE": 
      return Object.assign({}, status, {justDeleted: {type: "storysection", id: action.data.id, parent_id: action.data.parent_id}});
    // Section Preview
    case "SECTION_PREVIEW_FETCH": 
      return Object.assign({}, status, {fetchingSectionPreview: true});
    case "SECTION_PREVIEW_SET":
      return Object.assign({}, status, {sectionPreview: action.data, fetchingSectionPreview: false});
    // Auto-open Text Cards
    case "SECTION_SUBTITLE_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "section_subtitle", id: action.data.id, force: true}});
    case "SECTION_STAT_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "section_stat", id: action.data.id, force: true}});
    case "SECTION_DESCRIPTION_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "section_description", id: action.data.id, force: true}});
    case "SECTION_VISUALIZATION_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "section_visualization", id: action.data.id, force: true}});
    case "STORY_DESCRIPTION_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "story_description", id: action.data.id, force: true}});
    case "STORY_FOOTNOTE_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "story_footnote", id: action.data.id, force: true}});
    case "AUTHOR_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "author", id: action.data.id, force: true}});
    case "STORYSECTION_SUBTITLE_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "storysection_subtitle", id: action.data.id, force: true}});
    case "STORYSECTION_STAT_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "storysection_stat", id: action.data.id, force: true}});
    case "STORYSECTION_DESCRIPTION_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "storysection_description", id: action.data.id, force: true}});
    case "STORYSECTION_VISUALIZATION_NEW":
      return Object.assign({}, status, {dialogOpen: {type: "storysection_visualization", id: action.data.id, force: true}});
    // Clear force/toolbox states on delete
    case "SECTION_SUBTITLE_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "SECTION_STAT_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "SECTION_DESCRIPTION_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "SECTION_VISUALIZATION_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "STORY_DESCRIPTION_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "STORY_FOOTNOTE_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "AUTHOR_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "STORYSECTION_SUBTITLE_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "STORYSECTION_STAT_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "STORYSECTION_DESCRIPTION_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    case "STORYSECTION_VISUALIZATION_DELETE":
      return Object.assign({}, status, {dialogOpen: false});
    // Update Events
    // When an update attempt starts, clear the justUpdated variable, which will then be refilled with SUCCESS or ERROR.
    // This is to ensure that subsequent error messages freshly fire, even if they are the "same" error
    case "CLEAR_UPDATED": 
      return Object.assign({}, status, {justUpdated: false});
    // Note: some of the update event cases are written above
    case "PROFILE_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "profile", ...success}});
    case "STORY_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "story", ...success}});
    case "PROFILE_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "profile", ...error}});
    case "SECTION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "section", ...error}});
    case "STORY_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "story", ...error}});
    case "STORYSECTION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "storysection", ...error}});
    case "GENERATOR_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "generator", ...error}});
    case "MATERIALIZER_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "materializer", ...error}});
    case "FORMATTER_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "formatter", ...error}});
    case "SELECTOR_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "selector", ...error}});
    case "SECTION_SUBTITLE_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "section_subtitle", ...success}});
    case "SECTION_SUBTITLE_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "section_subtitle", ...error}});
    case "SECTION_STAT_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "section_stat", ...success}});
    case "SECTION_STAT_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "section_stat", ...error}});
    case "SECTION_DESCRIPTION_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "section_description", ...success}});
    case "SECTION_DESCRIPTION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "section_description", ...error}});
    case "SECTION_VISUALIZATION_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "section_visualization", ...success}});
    case "SECTION_VISUALIZATION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "section_visualization", ...error}});
    case "STORY_DESCRIPTION_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "story_description", ...success}});
    case "STORY_DESCRIPTION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "story_description", ...error}});
    case "STORY_FOOTNOTE_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "story_footnote", ...success}});
    case "STORY_FOOTNOTE_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "story_footnote", ...error}});
    case "AUTHOR_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "author", ...success}});
    case "AUTHOR_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "author", ...error}});
    case "STORYSECTION_SUBTITLE_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "storysection_subtitle", ...success}});
    case "STORYSECTION_SUBTITLE_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "storysection_subtitle", ...error}});
    case "STORYSECTION_STAT_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "storysection_stat", ...success}});
    case "STORYSECTION_STAT_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "storysection_stat", ...error}});
    case "STORYSECTION_DESCRIPTION_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "storysection_description", ...success}});
    case "STORYSECTION_DESCRIPTION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "storysection_description", ...error}});
    case "STORYSECTION_VISUALIZATION_UPDATE":
      return Object.assign({}, status, {dialogOpen: false, justUpdated: {type: "storysection_visualization", ...success}});
    case "STORYSECTION_VISUALIZATION_ERROR":
      return Object.assign({}, status, {justUpdated: {type: "storysection_visualization", ...error}});
    default: return status;
  }
};
