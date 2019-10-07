/** @type {LoadingState} */
export const loadingInitialState = {
  done: 0,
  error: undefined,
  inProgress: true,
  total: 1
};

/** @type {QueryState} */
export const queryInitialState = {
  activeChart: null,
  filters: [],
  groups: [],
  measure: "",
  showConfInt: false,
  timePeriod: 2019
};

/** @type {VizbuilderState} */
export const initialState = {
  charts: [],
  cubes: [],
  instance: {
    datacap: 20000,
    key: "vizbuilder",
    multipliers: {},
    permalink: true,
    permalinkKeys: {
      enlarged: "enlarged",
      filters: "filters",
      groups: "groups",
      measure: "measure"
    },
    topojson: [],
    visualizations: [
      "barchart",
      "barchartyear",
      "geomap",
      "lineplot",
      "stacked",
      "treemap"
    ]
  },
  loading: loadingInitialState,
  query: queryInitialState
};
