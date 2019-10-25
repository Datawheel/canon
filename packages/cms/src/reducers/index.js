/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

import profiles from "./profiles.js";
import cubeData from "./cubeData.js";
import status from "./status.js";
import formatters from "./formatters.js";

const initialState = {
  status: {
    diffCounter: 0,
    previews: [],
    variables: {},
    query: {}
  },
  cubeData: {},
  profiles: [],
  stories: [],
  formatters: []
};

/** */
export default function cmsReducer(state = initialState, action) {
  return {
    status: status(state.status, action),
    cubeData: cubeData(state.cubeData, action),
    profiles: profiles(state.profiles, action),
    formatters: formatters(state.formatters, action)
  };
}
