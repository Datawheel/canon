import formUrlDecoded from "form-urldecoded";
import formUrlEncoded from "form-urlencoded";
import yn from "yn";
import {isValidFilter, isValidGroup} from "./validation";

/**
 * Builds the permalink query object, to update in the current location.
 * @param {PermalinkKeywordMap} keywords
 * @param {object} state
 * @param {string?} state.activeChart
 * @param {FilterItem[]} state.filters
 * @param {GroupItem[]} state.groups
 * @param {MeasureItem} state.measure
 * @param {boolean} state.showConfInt
 * @param {number?} state.timePeriod
 */
export function stateToPermalink(keywords, state) {
  const locationQuery = {
    [keywords.measure]: state.measure.hash,
    [keywords.groups]: state.groups
      .filter(isValidGroup)
      .map(item => [item.hash, item.combine ? 1 : 0].concat(item.members).join("|")),
    [keywords.filters]: state.filters.length > 0
      ? state.filters
        .filter(isValidFilter)
        .map(item => `${item.measure}|${item.operator}|${item.interpretedValue}`)
      : undefined,
    [keywords.enlarged]: state.activeChart || undefined,
    [keywords.confint]: state.showConfInt || undefined,
    [keywords.period]: state.timePeriod || undefined
  };
  return formUrlEncoded(locationQuery, {
    ignorenull: true,
    sorted: false,
    skipIndex: false
  });
}

/**
 * @param {PermalinkKeywordMap} keywords
 * @param {string} locationSearch
 * @returns {{activeChart: string | undefined, filters: string[], groups: string[], measure: string, showConfInt: boolean, timePeriod: number}}
 */
export function permalinkToState(keywords, locationSearch) {
  const locationQuery = formUrlDecoded(locationSearch);
  return {
    activeChart: locationQuery[keywords.enlarged],
    filters: locationQuery[keywords.filters] || [],
    groups: locationQuery[keywords.groups] || [],
    measure: locationQuery[keywords.measure],
    showConfInt: yn(locationQuery[keywords.confint]) || false,
    timePeriod: Number.parseInt(locationQuery[keywords.period], 10)
  };
}
