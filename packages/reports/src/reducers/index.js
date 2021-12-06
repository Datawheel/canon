/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

import reports from "./reports.js";
import cubeData from "./cubeData.js";
import status from "./status.js";
import formatters from "./formatters.js";
import resources from "./resources.js";

const initialState = {
  status: {
    translationCounter: 0,
    translationError: false,
    query: {},
    pathObj: {},
    previews: []
  },
  cubeData: false,
  reports: {},
  formatters: [],
  resources: {
    formatterFunctions: false
  }
};

/** */
export default function reportsReducer(state = initialState, action) {
  return {
    status: status(state.status, action),
    cubeData: cubeData(state.cubeData, action),
    reports: reports(state.reports, action),
    formatters: formatters(state.formatters, action),
    resources: resources(state.resources, action)
  };
}
