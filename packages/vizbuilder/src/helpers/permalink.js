import Filter from "../components/Sidebar/FilterManager/Filter";
import Grouping from "../components/Sidebar/GroupingManager/Grouping";

import {fetchMembers} from "./fetch";
import {generateBaseState} from "./query";
import {findByKey} from "./sorting";
import {isValidFilter, isValidGrouping} from "./validation";

/**
 * Parses the current `locationSearch` using the `keywords` defined by the user, and
 * returns the result in an object. This object can also be optionally passed as `target`.
 * @template T
 * @param {PermalinkKeywordMap} keywords A map with the parameter keys to parse from the location search
 * @param {Location & {query:object}} location A location search parameter string
 * @param {T} [target] The object where the parsed parameters are going to be saved
 * @returns {Partial<T & PermalinkKeywordMap>}
 */
export function parsePermalink(keywords, location) {
  const locationQuery = location.query || {};
  return {
    measure: locationQuery[keywords.measure],
    groups: [].concat(locationQuery[keywords.groups]).filter(Boolean),
    filters: [].concat(locationQuery[keywords.filters]).filter(Boolean),
    enlarged: locationQuery[keywords.enlarged]
  };
}

/**
 * Builds the permalink query object, to update in the current location.
 * @param {PermalinkKeywordMap} keywords Permalink keyword map
 * @param {object} query The `query` element from the Vizbuilder's state.
 */
export function stateToPermalink(keywords, query) {
  const toString = item => `${item}`;
  return {
    [keywords.measure]: query.measure.annotations._key,
    [keywords.groups]: query.groups
      .filter(isValidGrouping)
      .map(toString)
      .sort(),
    [keywords.filters]: query.filters
      .filter(isValidFilter)
      .map(toString)
      .sort(),
    [keywords.enlarged]: query.activeChart || undefined
  };
}

/**
 * Reconstructs a complete minimal state from a permalink query object.
 * @param {ExternalQueryParams} queryParams The current permalink parameter object.
 * @param {object} prevState The current entire Vizbuilder's `state` object.
 */
export function permalinkToState(queryParams, prevState) {
  const oldOptions = prevState.options;
  const oldQuery = prevState.query;

  const measures = oldOptions.measures;
  const measure = findByKey(queryParams.measure, measures) || oldQuery.measure;

  const newState = generateBaseState(oldOptions.cubes, measure);
  const newQuery = newState.query;

  newQuery.activeChart = queryParams.enlarged || null;

  newQuery.filters = queryParams.filters
    .map(filterHash => {
      const parts = filterHash.split("-");
      const value = parts.pop() * 1 || 0;
      const operator = parts.pop() * 1 || OPERATORS.EQUAL;
      const measureKey = parts.join("-");
      const measure = findByKey(measureKey, measures);
      return measure && new Filter(measure, operator, value);
    })
    .filter(Boolean);

  return Promise.resolve(newState).then(state => {
    const groupPromises = queryParams.groups.reduce((promises, groupHash) => {
      const parts = groupHash.split("-");
      const levelKey = parts.shift();
      const level = findByKey(levelKey, state.options.levels);
      if (level) {
        const memberKeys = parts.join("-").split("~");
        let promise;
        if (memberKeys.length > 0) {
          promise = fetchMembers(level).then(members => {
            const finalMembers = members
              .filter(member => memberKeys.indexOf(`${member.key}`) > -1)
              .sort((a, b) => `${a.key}`.localeCompare(`${b.key}`));
            return new Grouping(level, finalMembers);
          });
        } else {
          promise = new Grouping(level);
        }
        promises.push(promise);
      }
      return promises;
    }, []);

    if (!groupPromises.length) {
      const level = state.options.levels[0];
      groupPromises.push(
        fetchMembers(level).then(members => new Grouping(level, members))
      );
    }

    return Promise.all(groupPromises).then(groups => {
      state.query.groups = groups;
      return state;
    });
  });
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
