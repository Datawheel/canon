import keyBy from "lodash/keyBy";

/**
 * @template T
 * @param {T[]} list
 * @param {keyof T} property
 */
export function arrayToMapBy(list, property) {

  /** @type {Record<string, T>} */
  const target = {};
  return list.reduce((target, item) => {
    const key = `${item[property]}`;
    target[key] = item;
    return target;
  }, target);
}

/**
 * @template T
 * @param {T[]} list
 * @param {keyof T} property
 */
export function arrayToPropertySet(list, property) {
  const targetMap = keyBy(list, item => {
    const value = item[property];
    // eslint-disable-next-line eqeqeq
    return value != null ? value : undefined;
  });
  return Object.keys(targetMap);
}

/**
 * @param {any[]} dataset
 * @param {string[]} properties
 */
export function datasetToMemberMap(dataset, properties) {

  /** @type {Record<string, any[]>} */
  const memberMap = {};

  /** @type {Record<string, number>} */
  const countMap = {};

  let p = properties.length;
  while (p--) {
    const property = `${properties[p]}`;
    const memberSet = new Set();

    let n = dataset.length;
    while (n--) {
      const value = dataset[n][property];
      memberSet.add(value);
    }
    memberMap[property] = Array.from(memberSet).sort();
    countMap[property] = memberSet.size;
  }
  return {countMap, memberMap};
}

/**
 * @param {string} fullName
 * @returns {LevelLike}
 */
export function fullNameToLevelLike(fullName) {
  const match = fullName.match(/[^\]\.\[]+/g);
  return !match
    ? {dimension: "", hierarchy: "", name: fullName}
    : match.length === 1
      ? {dimension: match[0], hierarchy: "", name: match[0]}
      : match.length === 2
        ? {dimension: match[0], hierarchy: "", name: match[1]}
        : {dimension: match[0], hierarchy: match[1], name: match[2]};
}
