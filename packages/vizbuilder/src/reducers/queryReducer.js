import {
  QUERY_CHART_UPDATE,
  QUERY_CONFINT_TOGGLE,
  QUERY_FILTERS_CREATE,
  QUERY_FILTERS_DELETE,
  QUERY_FILTERS_UPDATE,
  QUERY_GROUPS_CREATE,
  QUERY_GROUPS_DELETE,
  QUERY_GROUPS_UPDATE,
  QUERY_MEASURE_UPDATE,
  QUERY_PERIOD_UPDATE
} from "../actions/query";
import {replaceItem} from "../helpers/arrays";
import {queryInitialState} from "./state";

/** @type {{[action: string]: (state: QueryState, _) => QueryState}} */
const actions = {
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
   * @param {FilterItem} newFilter
   */
  [QUERY_FILTERS_CREATE]: (state, newFilter) => ({
    ...state,
    filters: state.filters.concat(newFilter)
  }),

  /**
   * @param {QueryState} state
   * @param {FilterItem} filter
   */
  [QUERY_FILTERS_DELETE]: (state, {key: filterKey}) => ({
    ...state,
    filters: state.filters.filter(item => item.key !== filterKey)
  }),

  /**
   * @param {FilterItem} filter
   */
  [QUERY_FILTERS_UPDATE]: (state, filter) => ({
    ...state,
    filters: replaceItem(filter, state.filters, "key")
  }),

  /**
   * @param {GroupItem} newGroup
   */
  [QUERY_GROUPS_CREATE]: (state, newGroup) => ({
    ...state,
    groups: state.groups.concat(newGroup)
  }),

  /**
   * @param {QueryState} state
   * @param {GroupItem} group
   */
  [QUERY_GROUPS_DELETE]: (state, {key: groupKey}) => ({
    ...state,
    groups: state.groups.filter(item => (item.key = groupKey))
  }),

  /**
   * @param {GroupItem} group
   */
  [QUERY_GROUPS_UPDATE]: (state, group) => ({
    ...state,
    groups: replaceItem(group, state.groups, "key")
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

/** @type {import("redux").Reducer<QueryState>} */
function queryReducer(state = queryInitialState, {type, payload}) {
  return type in actions ? actions[type](state, payload) : state;
}

export default queryReducer;
