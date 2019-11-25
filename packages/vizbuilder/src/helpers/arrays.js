import groupBy from "lodash/groupBy";

/**
 * @template T
 * @param {T[]} list
 * @returns {{next: () => ({value: T, done: false} | {done: true})}}
 */
export function iteratorFactory(list) {
  let index = 0;
  return {
    next: function() {
      return index < list.length ? {value: list[index++], done: false} : {done: true};
    }
  };
}

/**
 * @param {CubeItem[]} cubes
 * @returns {{next: () => ({value: MeasureItem, done: false} | {done: true})}}
 */
export function measureIteratorFactory(cubes = []) {
  let cbIndex = 0;
  let msIndex = 0;

  function next() {
    if (cbIndex === cubes.length) {
      return {done: true};
    }
    const {measures} = cubes[cbIndex];
    if (msIndex === measures.length) {
      cbIndex++;
      msIndex = 0;
      return next();
    }
    return {value: measures[msIndex++], done: false};
  }

  return {next};
}

/**
 * @param {DimensionItem[]} dimensions
 * @returns {{next: () => ({value: LevelItem, done: false} | {done: true})}}
 */
export function levelIteratorFactory(dimensions) {
  let dimIndex = 0;
  let hieIndex = 0;
  let lvlIndex = 0;

  function next() {
    if (dimIndex === dimensions.length) {
      return {done: true};
    }
    const {hierarchies} = dimensions[dimIndex];
    if (hieIndex === hierarchies.length) {
      dimIndex++;
      hieIndex = 0;
      return next();
    }
    const {levels} = hierarchies[hieIndex];
    if (lvlIndex === levels.length) {
      hieIndex++;
      lvlIndex = 0;
      return next();
    }
    return {value: levels[lvlIndex++], done: false};
  }

  return {next};
}

/**
 * Ensures some object is always an array, or inside one. If the value is falsey, the array will be empty.
 * @template T
 * @param {T | T[] | undefined} obj The object to wrap in an array.
 * @param {T[]} target The base array to be used as target.
 * @returns {T[]}
 */
export function ensureArray(obj, target = []) {
  return obj == null ? target : target.concat(obj);
}

/**
 * Replaces an item in an array of items. The item to replace is picked by the
 * property set in the `property` param. Returns a modified copy of the original
 * array.
 * @template T
 * @param {T} needle
 * @param {T[]} haystack
 * @param {keyof T} property
 */
export function replaceItem(needle, haystack, property) {
  const propValue = needle[property];
  const index = haystack.findIndex(item => item[property] === propValue);
  if (index > -1) {
    const haystackClone = haystack.slice();
    haystackClone[index] = needle;
    return haystackClone;
  }
  return haystack;
}

/**
 * Returns an array of permutations taking 2 elements from the supplied array.
 * @template T
 * @param {T[]} set
 * @param {T[][]} result
 */
export function getPermutations(set, result = []) {
  if (set.length === 0) return [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m);
    }
    else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(set);

  return result;
}

/**
 * TODO: Convert to generalized time
 * @param {any[]} dataset
 * @param {object} param1
 * @param {string} param1.levelName1
 * @param {string} param1.timeLevelName
 */
export function getTopTenByYear(dataset, {levelName1, timeLevelName}) {
  const groups = groupBy(dataset, timeLevelName);

  let newDataset;
  const topElements = Object.keys(groups).reduce((all, time) => {
    const top = groups[time].slice(0, 10);
    return all.concat(top);
  }, []);

  const topElementsDatasets = groupBy(topElements, levelName1);
  if (Object.keys(topElementsDatasets).length > 12) {
    const time = Object.keys(groups).sort().pop();
    const timeElements = groupBy(groups[time].slice(0, 10), levelName1);
    newDataset = dataset.filter(item => item[levelName1] in timeElements);
  }
  else {
    newDataset = topElements;
  }

  return newDataset;
}
