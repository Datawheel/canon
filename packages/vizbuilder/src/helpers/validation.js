import yn from "yn";

import {findFirstNumber} from "./formatting";

/**
 * Checks if the dimension passed as argument is a time-type dimension.
 * @param {Dimension} dimension A mondrian-rest-client dimension object
 * @returns {boolean}
 */
export function isTimeDimension(dimension) {
  return (
    dimension.dimensionType === 1 ||
    dimension.name === "Date" ||
    dimension.name === "Year"
  );
}

export function isValidMeasure(measure) {
  const ann = measure.annotations;
  const aggregatorType =
    ann.pre_aggregation_method ||
    ann.aggregation_method ||
    measure.aggregatorType ||
    "UNKNOWN";

  return !(
    yn(ann.hide_in_ui) ||
    ann.error_for_measure ||
    ann.error_type ||
    ann.source_for_measure ||
    ann.collection_for_measure ||
    aggregatorType === "RCA"
  );
}

/**
 * Checks if an object can be used as a filter.
 * This means it should have a measure, a valid operator, and a numeric value.
 * @param {object} filter An object to check
 */
export function isValidFilter(filter) {
  return filter && filter.measure && filter.operator > 0 && filter.hasValue;
}

/**
 * Checks if an object can be used as a grouping.
 * This means it should have a valid level.
 * @param {object} filter An object to check
 */
export function isValidGrouping(grouping) {
  return grouping && grouping.level;
}

/**
 * Checks if a Grouping object can be used as a cut.
 * This means it should have at least 1 member.
 * @param {object} grouping An object to check
 */
export function isValidCut(grouping) {
  return isValidGrouping(grouping) && grouping.hasMembers;
}

/**
 *
 * @param {PermalinkKeywordMap} keywords A map with the parameter keys to parse from the location search
 * @param {object} query1 A parsed query object from current's `location.search` parameters
 * @param {object} query2 A parsed query object from current's `location.search` parameters
 */
export function isSamePermalinkQuery(keywords, query1, query2) {
  return (
    query1[keywords.measure] === query2[keywords.measure] &&
    isSameArrayShallow(query1[keywords.groups], query2[keywords.groups]) &&
    isSameArrayShallow(query1[keywords.filters], query2[keywords.filters]) &&
    query1[keywords.enlarged] === query2[keywords.enlarged]
  );
}

/**
 * Compares two Vizbuilder's query state object to check if it contains the same parameters.
 * @param {object} query1 A query object from Vizbuilder's state
 * @param {object} query2 A query object from Vizbuilder's state
 */
export function isSameQuery(query1, query2) {
  return (
    query1.measure === query2.measure &&
    query1.activeChart === query2.activeChart &&
    areSameObjects(isValidGrouping, query1.groups, query2.groups) &&
    areSameObjects(isValidFilter, query1.filters, query2.filters)
  );
}

/**
 * Compares two condition arrays and checks if all its elements are equivalent.
 * @param {obj => boolean} validator A function to validate objects
 * @param {object[]} obj1 An array of serializable objects to compare
 * @param {object[]} obj2 An array of serializable objects to compare
 */
export function areSameObjects(validator, obj1, obj2) {
  obj1 = obj1.filter(validator);
  obj2 = obj2.filter(validator);

  let n = obj1.length;

  if (n !== obj2.length) {
    return false;
  }

  while (n--) {
    if (`${obj1[n]}` !== `${obj2[n]}`) {
      return false;
    }
  }

  return true;
}

/**
 * Makes a shallow comparison between two arrays.
 * Returns false if they aren't the same length, or if at certain index both
 * elements arent equal. Otherwise returns true.
 * @param {any[]} array1 An array to compare
 * @param {any[]} array2 An array to compare
 */
export function isSameArrayShallow(array1, array2) {
  array1 = [].concat(array1 || []);
  array2 = [].concat(array2 || []);

  let n = array1.length;

  if (n !== array2.length) {
    return false;
  }

  while (n--) {
    if (array1[n] !== array2[n]) {
      return false;
    }
  }

  return true;
}

/**
 * Determines if an object is a valid finite number.
 * @param {any} n object to check
 */
export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Tries to guess if the elements in a list of strings are related to a number.
 * Useful to sort by that number.
 * @param {string[]} list An array of string to determine
 */
export function areKindaNumeric(list, tolerance = 0.8) {
  return (
    list.reduce(
      (sum, item) => sum + (isNumeric(findFirstNumber(item)) ? 1 : 0),
      0
    ) /
      list.length >
    tolerance
  );
}

/**
 * Checks if all the additional measures (MoE, UCI, LCI) in a dataset are different from zero.
 * @see Issue#257 on {@link https://github.com/Datawheel/canon/issues/257 | Github}
 * @param {object} query An object with the names of the properties in each item in dataset.
 * @param {object[]} dataset The dataset to analyze.
 */
export function areMetaMeasuresZero(query, dataset) {
  const {moeName, lciName, uciName} = query;
  const results = {};
  let n = dataset.length;
  while (n--) {
    const item = dataset[n];
    results.moe = results.moe || item[moeName] > 0;
    results.lci = results.lci || item[lciName] > 0;
    results.uci = results.uci || item[uciName] > 0;
  }
  return results;
}
