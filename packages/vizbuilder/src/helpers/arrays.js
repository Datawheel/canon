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
export const ensureArray = (obj, target = []) => (obj == null ? target : target.concat(obj));

/**
 * Iterates over all levels in a dimension array and returns the first that matches according to the `predicate` function.
 * TODO: try to use generics
 * @param {any[]} dimensions
 * @param {(level: any, hierarchy: any, dimension: any) => boolean} predicate
 */
export const findLevel = (dimensions, predicate) => {
  for (let dimension, d = 0; (dimension = dimensions[d]); d++) {
    for (let hierarchy, h = 0; (hierarchy = dimension.hierarchies[h]); h++) {
      for (let level, l = 0; (level = hierarchy.levels[l]); l++) {
        if (predicate(level, hierarchy, dimension)) {
          return level;
        }
      }
    }
  }
  return undefined;
};

/**
 * Replaces an item in an array of items. The item to replace is picked by the
 * property set in the `property` param. Returns a modified copy of the original
 * array.
 * @template T
 * @param {T} needle
 * @param {T[]} haystack
 * @param {keyof T} property
 */
export const replaceItem = (needle, haystack, property) => {
  const propValue = needle[property];
  const index = haystack.findIndex(item => item[property] === propValue);
  if (index > -1) {
    const haystackClone = haystack.slice();
    haystackClone[index] = needle;
    return haystackClone;
  }
  return haystack;
};
