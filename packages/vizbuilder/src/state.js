import PropTypes from "prop-types";

export default function initialStateFactory() {
  return {
    load: {
      inProgress: false,
      total: 0,
      done: 0,
      error: undefined,
      severity: -1
    },
    query: {
      conditions: [],
      cube: null,
      dimension: null,
      drilldown: null,
      measure: null,
      moe: null,
      limit: undefined,
      locale: "en",
      offset: undefined,
      order: undefined,
      orderDesc: undefined,
      timeDrilldown: null
    },
    // This object is later combined into `query` as part of the query building
    queryOptions: {
      nonempty: true,
      distinct: false,
      parents: false,
      debug: false,
      sparse: true
    },
    options: {
      cubes: [], // All cubes retrieved initially
      dimensions: [], /* All non-time dimensions for the
                         cube which owns the current measure */
      levels: [], // All valid levels from this `dimensions` array
      measures: [], // All valid measures (not MoEs) from all the cubes retrieved
      // ??
      members: []
    },
    dataset: [],
    members: {},
    meta: {}
  };
}

export const loadTypes = PropTypes.shape({
  inProgress: PropTypes.bool,
  total: PropTypes.number,
  done: PropTypes.number,
  error: PropTypes.instanceOf(Error)
});

export const queryTypes = PropTypes.shape({
  conditions: PropTypes.array,
  cube: PropTypes.any,
  dimension: PropTypes.any,
  drilldown: PropTypes.any,
  measure: PropTypes.any,
  moe: PropTypes.any,
  limit: PropTypes.number,
  locale: PropTypes.string,
  offset: PropTypes.number,
  options: PropTypes.any,
  order: PropTypes.any,
  orderDesc: PropTypes.bool,
  timeDrilldown: PropTypes.any
});

export const optionsTypes = PropTypes.shape({
  cubes: PropTypes.array,
  dimensions: PropTypes.array,
  levels: PropTypes.array,
  measures: PropTypes.array
});
