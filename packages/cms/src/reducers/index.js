/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

import profiles from "./profiles.js";
import cubeData from "./cubeData.js";

const initialState = {
  status: {},
  cubeData: {},
  profiles: [],
  stories: [],
  formatters: {},
  locale: {}
};

/** */
export default function cmsReducer(state = initialState, action) {
  return {
    cubeData: cubeData(state.cubeData, action),
    profiles: profiles(state.profiles, action)
  };
}
