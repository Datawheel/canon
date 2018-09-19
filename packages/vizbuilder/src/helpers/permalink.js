import queryString from "query-string";
import {
  findByKey,
  finishBuildingStateFromParameters,
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns
} from "./sorting";

/**
 * Parses the current `locationSearch` using the `keywords` defined by the user, and
 * returns the result in an object. This object can also be optionally passed as `target`.
 * @template T
 * @param {Location & {query:object}} location A location search parameter string
 * @param {PermalinkKeywordMap} keywords A map with the parameter keys to parse from the location search
 * @param {T} [target] The object where the parsed parameters are going to be saved
 * @returns {T & PermalinkKeywordMap}
 */
export function parsePermalink(location, keywords, target) {
  const locationQuery =
    location.query || queryString.parse(location.search) || {};

  return Object.keys(keywords).reduce((query, key) => {
    const assignedKey = keywords[key];
    query[key] = locationQuery[assignedKey];
    return query;
  }, target || {});
}

/**
 * Builds the permalink query object, to update in the current location.
 * @param {object} query The `query` element from the Vizbuilder's state.
 * @param {PermalinkKeywordMap} keywords Permalink keyword map
 */
export function stateToPermalink(query, keywords) {
  return {
    [keywords.measure]: query.measure.annotations._key,
    [keywords.dimension]: query.dimension.annotations._key,
    [keywords.level]: query.drilldown.annotations._key,
    [keywords.filters]: query.measure.annotations._key,
    [keywords.enlarged]: query.activeChart
  };
}

/**
 * Reconstructs a complete minimal state from a permalink query object.
 * @param {object} prevState The current entire Vizbuilder's `state` object.
 * @param {ExternalQueryParams} queryParams The current permalink parameter object.
 */
export function permalinkToState(prevState, queryParams) {
  const stateOptions = prevState.options;

  const measures = stateOptions.measures;
  const measure = findByKey(queryParams.measure, measures, true);

  const cubeName = measure.annotations._cb_name;
  const cube = stateOptions.cubes.find(cube => cube.name === cubeName);

  const dimensions = getValidDimensions(cube);
  const drilldowns = getValidDrilldowns(dimensions);

  const nextState = {
    query: {
      activeChart: queryParams.enlarged,
      conditions: [],
      cube,
      measure,
      moe: getMeasureMOE(cube, measure),
      timeDrilldown: getTimeDrilldown(cube)
    },
    options: {dimensions, drilldowns}
  };

  return finishBuildingStateFromParameters(nextState, queryParams);
}

/**
 * @typedef {Object<string,string>} DefaultQueryParams
 * @prop {string} [defaultDimension] Initial dimension set by the user
 * @prop {string} [defaultLevel] Initial level for drilldown set by the user
 * @prop {string} [defaultMeasure] Initial measure set by the user
 */

/**
 * @typedef {Object<string,string>} PermalinkQueryParams
 * @prop {string} [measure] Measure name hashed key
 * @prop {string} [level] Level name hashed key
 * @prop {string} [dimension] Dimension name hashed key
 * @prop {string} [filters] Condition hash key list
 * @prop {string} [enlarged] Chart type name
 */

/**
 * @typedef {DefaultQueryParams & PermalinkQueryParams} ExternalQueryParams
 */

/**
 * @typedef {PermalinkQueryParams} PermalinkKeywordMap
 */
