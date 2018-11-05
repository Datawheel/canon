/**
 * Generates a new, empty initial state for the whole Vizbuilder.
 */
export default function initialStateFactory() {
  return {
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
      // All valid measures (not confidence/MoE) from the cubes retrieved
      measures: [],
      // All valid levels from the current cube
      levels: []
    },
    query: {
      // The user can modify these:
      measure: null,
      groups: [],
      filters: [],
      activeChart: null,
      // These are calculated from the above ones:
      cube: null,
      timeLevel: null,
      lci: null,
      uci: null,
      moe: null,
      source: null,
      collection: null
    },
    queries: [],
    datasets: [],
    members: []
  };
}
