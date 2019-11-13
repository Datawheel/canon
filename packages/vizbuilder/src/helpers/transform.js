import {ensureArray} from "./arrays";

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
export function arrayToArrayMapBy(list, property) {
  /** @type {Record<string, T[]>} */
  const target = {};
  return list.reduce((target, item) => {
    const key = `${item[property]}`;
    target[key] = ensureArray(target[key]).concat(item);
    return target;
  }, target);
}

/**
 * @template T
 * @param {T[]} list
 * @param {keyof T} property
 */
export function arrayToPropertySet(list, property) {
  /** @type {Record<string, number>} */
  const targetMap = {};
  for (let item, i = 0; (item = list[i]); i++) {
    const value = item[property];
    if (value != null) {
      targetMap[`${value}`] = 0;
    }
  }
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
