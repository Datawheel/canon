import Store from "./class";

/** @type {Store<VizbuilderState>} */
const state = new Store({
  load: {
    fetching: false,
    total: 0,
    current: 0
  },
  options: {
    cubes: [],
    measures: [],
    levels: []
  },
  query: {
    cube: null,
    // measures: [],
    measure: null,
    drilldowns: [],
    cuts: [],
    options: {},
    limit: undefined,
    offset: undefined,
    order: undefined,
    orderDesc: undefined
  },
  dataset: [
    { parent: "Group 1", id: "alpha", value: 29 },
    { parent: "Group 1", id: "beta", value: 10 },
    { parent: "Group 1", id: "gamma", value: 2 },
    { parent: "Group 2", id: "delta", value: 29 },
    { parent: "Group 2", id: "eta", value: 25 }
  ]
});

export default state;
