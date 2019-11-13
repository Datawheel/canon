import {
  QUERY_CHART_UPDATE,
  QUERY_CONFINT_TOGGLE,
  QUERY_FILTERS_DELETE,
  QUERY_FILTERS_UPDATE,
  QUERY_GROUPS_DELETE,
  QUERY_GROUPS_UPDATE,
  QUERY_MEASURE_UPDATE,
  QUERY_PERIOD_UPDATE,
  QUERY_INYECT,
  QUERY_RESET
} from "./actions";

/** @type {QueryState} */
export const queryInitialState = {
  activeChart: null,
  filters: {},
  groups: {},
  measure: "",
  showConfInt: false,
  timePeriod: 2019
};

/** @type {import("redux").Reducer<QueryState>} */
export function queryReducer(state = queryInitialState, {type, payload}) {
  return type in actions ? actions[type](state, payload) : state;
}

/** @type {{[action: string]: (state: QueryState, _) => QueryState}} */
const actions = {
  /**
   * @param {Partial<QueryState>} queryState
   */
  [QUERY_INYECT]: (state, queryState) => ({
    ...state,
    ...queryState
  }),

  [QUERY_RESET]: () => queryInitialState,

  /**
   * @param {string | undefined} activeChart
   */
  [QUERY_CHART_UPDATE]: (state, activeChart) => ({
    ...state,
    activeChart: activeChart || null
  }),

  /**
   * @param {QueryState} state
   * @param {boolean} showConfInt
   */
  [QUERY_CONFINT_TOGGLE]: (state, showConfInt) => ({
    ...state,
    showConfInt: Boolean(showConfInt)
  }),

  /**
   * @param {FilterItem} filter
   */
  [QUERY_FILTERS_DELETE]: (state, filter) => {
    const {key: filterKey} = filter;
    const {[filterKey]: _, ...filters} = state.filters;
    return {...state, filters};
  },

  /**
   * @param {FilterItem} filter
   */
  [QUERY_FILTERS_UPDATE]: (state, filter) => ({
    ...state,
    filters: {
      ...state.filters,
      [filter.key]: filter
    }
  }),

  /**
   * @param {GroupItem} group
   */
  [QUERY_GROUPS_DELETE]: (state, group) => {
    const count = Object.keys(state.groups).length;
    if (count > 1) {
      const {key: groupKey} = group;
      const {[groupKey]: _, ...groups} = state.groups;
      return {...state, groups};
    }
    return state;
  },

  /**
   * @param {GroupItem} group
   */
  [QUERY_GROUPS_UPDATE]: (state, group) => ({
    ...state,
    groups: {
      ...state.groups,
      [group.key]: group
    }
  }),

  /**
   * @param {string} measure
   */
  [QUERY_MEASURE_UPDATE]: (state, measure) => ({...state, measure}),

  /**
   * @param {QueryState} state
   * @param {number} timePeriod
   */
  [QUERY_PERIOD_UPDATE]: (state, timePeriod) => ({
    ...state,
    timePeriod: timePeriod || null
  })
};
