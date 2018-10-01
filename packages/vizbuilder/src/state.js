/**
 * Generates a new, empty initial state for the whole Vizbuilder.
 */
export default function initialStateFactory() {
  return {
    lastUpdate: null,
    load: {
      inProgress: false,
      total: 0,
      done: 0,
      error: undefined,
      severity: -1
    },
    options: {
      // All cubes retrieved initially
      cubes: [],
      // All non-time Dimensions for the cube which owns the current measure
      dimensions: [],
      // All valid levels from the `dimensions` array
      levels: [],
      // All non-time Levels that can be used as Cuts for the current query
      drilldowns: [],
      // All valid measures (not MoEs) from all the cubes retrieved
      measures: []
    },
    query: {
      groupings: [],
      filters: [],
      activeChart: null,
      conditions: [],
      cube: null,
      dimension: null,
      drilldown: null,
      measure: null,
      lci: null,
      uci: null,
      moe: null,
      source: null,
      collection: null,
      timeDrilldown: null,
      limit: undefined,
      locale: "en",
      offset: undefined,
      order: undefined,
      orderDesc: undefined,
      optionsNonempty: true,
      optionsDistinct: false,
      optionsParents: false,
      optionsDebug: false,
      optionsSparse: true
    },
    dataset: [],
    members: {},
    metaQueries: [],
    metaDatasets: [],
    metaMembers: []
  };
}
