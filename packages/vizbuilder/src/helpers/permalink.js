import {uuid} from "d3plus-common";

import {fetchMembers} from "../actions/fetch";
import {
  findByKey,
  finishBuildingStateFromParameters,
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  reduceLevelsFromDimension
} from "./sorting";
import {isValidCondition} from "./validation";

/**
 * Parses the current `locationSearch` using the `keywords` defined by the user, and
 * returns the result in an object. This object can also be optionally passed as `target`.
 * @template T
 * @param {PermalinkKeywordMap} keywords A map with the parameter keys to parse from the location search
 * @param {Location & {query:object}} location A location search parameter string
 * @param {T} [target] The object where the parsed parameters are going to be saved
 * @returns {T & PermalinkKeywordMap}
 */
export function parsePermalink(keywords, location, target) {
  const locationQuery = location.query || {};

  return Object.keys(keywords).reduce((query, key) => {
    const assignedKey = keywords[key];
    query[key] = locationQuery[assignedKey];
    return query;
  }, target || {});
}

/**
 * Builds the permalink query object, to update in the current location.
 * @param {PermalinkKeywordMap} keywords Permalink keyword map
 * @param {object} query The `query` element from the Vizbuilder's state.
 */
export function stateToPermalink(keywords, query) {
  return {
    [keywords.measure]: query.measure.annotations._key,
    [keywords.dimension]: query.dimension.annotations._key,
    [keywords.level]: query.drilldown.annotations._key,
    [keywords.filters]: query.conditions
      .filter(isValidCondition)
      .map(serializeCondition),
    [keywords.enlarged]: query.activeChart || undefined
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
 * Converts a Condition object into a serialized, decodeable string
 * @param {Condition} condition A Condition object to serialize
 */
export function serializeCondition(condition) {
  return [
    condition.type.substr(0, 1),
    condition.property.annotations._key,
    condition.operator,
    condition.type === "cut"
      ? condition.values.map(member => member.key).join(",")
      : condition.values[0]
  ].join("-");
}

/**
 * Converts a serialized condition into a Condition object
 * @param {Measure[]} measures List of measures for the current cube
 * @param {Dimension} dimension The current dimension
 * @param {string} conditionHash A condition encoded by `serializeCondition`
 */
export function unserializeCondition(measures, dimension, conditionHash) {
  const conditionTokens = conditionHash.split("-");

  const condition = {
    hash: uuid(),
    type: conditionTokens[0] === "c" ? "cut" : "filter",
    property: null,
    operator: conditionTokens[2] * 1,
    values: []
  };

  let promise;
  if (condition.type === "cut") {
    const levels = reduceLevelsFromDimension(dimension);
    condition.property = findByKey(conditionTokens[1], levels);

    promise = fetchMembers(condition.property).then(members => {
      condition.values = conditionTokens[3]
        .split(",")
        .map(memberKey => members.find(member => member.key == memberKey));
      return condition;
    });
  } else {
    condition.property = findByKey(conditionTokens[1], measures);
    condition.values = conditionTokens.slice(3, 4);

    promise = Promise.resolve(condition);
  }

  return promise;
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
