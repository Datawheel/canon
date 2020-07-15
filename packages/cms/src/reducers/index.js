/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

import profiles from "./profiles.js";
import cubeData from "./cubeData.js";
import status from "./status.js";
import formatters from "./formatters.js";
import stories from "./stories.js";
import resources from "./resources.js";
import variables from "./variables.js";

const initialState = {
  status: {
    diffCounter: 0,
    previews: null,
    query: {},
    pathObj: {}
  },
  cubeData: false,
  profiles: [],
  stories: [],
  formatters: [],
  resources: {
    formatterFunctions: {}
  },
  variables: {}
};

/** */
export default function cmsReducer(state = initialState, action) {
  return {
    status: status(state.status, action),
    cubeData: cubeData(state.cubeData, action),
    profiles: profiles(state.profiles, action),
    stories: stories(state.stories, action),
    formatters: formatters(state.formatters, action),
    resources: resources(state.resources, action),
    variables: variables(state.variables, action)
  };
}
