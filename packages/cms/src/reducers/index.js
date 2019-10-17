/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

import profiles from "./profiles.js";

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
    profiles: profiles(state.profiles, action)
  };
}
