import {findFirstNumber} from "./find";

/**
 * Checks if the dimension passed as argument is a time-type dimension.
 * @param {DimensionItem} dimensionItem
 * @returns {boolean}
 */
export function isTimeDimension(dimensionItem) {
  return dimensionItem.type === "TIME";
}

/**
 * Checks if the dimension should be presented in the UI.
 * @param {DimensionItem} dimensionItem A mondrian-rest-client dimension object
 */
export function isValidDimension(dimensionItem) {
  return !isTimeDimension(dimensionItem) && !dimensionItem.hideInUi;
}

/**
 * Checks if a measure is valid to show in Vizbuilder's Measure selector.
 * @param {MeasureItem} measure
 */
export function isValidMeasure(measure) {
  return !(
    measure.hideInUi ||
    measure.isMOEFor ||
    measure.isLCIFor ||
    measure.isUCIFor ||
    measure.isCollectionFor ||
    measure.isSourceFor ||
    measure.aggregationType === "RCA"
  );
}

/**
 * Checks if an object can be used as a filter.
 * This means it should have a measure, a valid operator, and a numeric value.
 * @param {object} filter An object to check
 * @returns {filter is FilterItem}
 */
export function isValidFilter(filter) {
  return (
    filter && filter.measure && filter.operator && isNumeric(filter.interpretedValue)
  );
}

/**
 * Checks if an object can be used as a grouping.
 * This means it should have a valid level.
 * @param {object} group An object to check
 * @returns {group is GroupItem}
 */
export function isValidGroup(group) {
  return group && group.level && group.hierarchy && group.dimension;
}

/**
 * Checks if a Grouping object can be used as a cut.
 * This means it should have at least 1 member.
 * @param {object} group An object to check
 */
export function isValidCut(group) {
  return isValidGroup(group) && group.members.length > 0;
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
  const numericReducer = (sum, item) => sum + (isNumeric(findFirstNumber(item)) ? 1 : 0);
  return list.reduce(numericReducer, 0) / list.length > tolerance;
}

/**
 * Checks if all the additional measures (MoE, UCI, LCI) in a dataset are different from zero.
 * @see Issue#257 on {@link https://github.com/Datawheel/canon/issues/257 | Github}
 * @param {any[]} dataset The dataset to analyze.
 * @param {Record<string, string>} names
 */
export function areMetaMeasuresZero(
  dataset,
  {moeName, lciName, uciName, sourceName, collectionName}
) {
  const results = {};
  let n = dataset.length;
  while (n--) {
    const item = dataset[n];
    results.moe = results.moe || !(isNaN(item[moeName]) || item[moeName] === 0);
    results.lci = results.lci || !(isNaN(item[lciName]) || item[lciName] === 0);
    results.uci = results.uci || !(isNaN(item[uciName]) || item[uciName] === 0);
    results.src = results.src || !!item[sourceName];
    results.clt = results.clt || !!item[collectionName];
  }
  return results;
}

/**
 * Checks if two objects make reference to the same level.
 * This verification supposes both object belong to the same cube and server.
 * @param {LevelLike} a
 * @param {LevelLike} b
 */
export function isSameLevel(a, b) {
  return (
    a.name === b.name &&
    (!a.dimension || !b.dimension || a.dimension === b.dimension) &&
    (!a.hierarchy || !b.hierarchy || a.hierarchy === b.hierarchy)
  );
}

/**
 * Checks for duplicate levels, based on their names.
 * If a duplicate is found, the level whose hierarchy name
 * is different to their own name is removed.
 * @see Issue#136 on {@link https://github.com/Datawheel/canon/issues/136 | GitHub}
 * @param {LevelItem[]} list The level array to filter
 */
export function removeDuplicateLevels(list) {
  const nameList = list.map(lvl => lvl.name);
  let n = list.length;
  while (n--) {
    const currName = nameList[n];
    if (
      // the current element's name is more than once on the list
      nameList.indexOf(currName) !== nameList.lastIndexOf(currName) &&
      // and its hierarchy's name is different to its own name
      list[n].hierarchy !== currName
    ) {
      nameList.splice(n, 1);
      list.splice(n, 1);
    }
  }
  return list;
}
