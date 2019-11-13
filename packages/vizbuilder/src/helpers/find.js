import escapeRegExp from "lodash/escapeRegExp";
import {sortNumbers} from "./sort";
import {isSameLevel} from "./validation";

/**
 * Returns the first element in `haystack` that matches an element from `needles`,
 * under the criteria provided by `matchingFunction`. The search is done by each needle.
 * If `elseFirst` is true and there's no match, returns the first element in `haystack`.
 * @template T
 * @template U
 * @param {(needle: T, haystack: U[]) => U | undefined} matchingFunction The function to use to find the elements
 * @param {T[]} needles The array of default names to search for
 * @param {U[]} haystack The array where to search for the object
 * @param {boolean} [elseFirst] A flag to return the first element in case of no matching result
 */
export function doubleFinder(matchingFunction, needles, haystack, elseFirst = false) {
  needles = needles.slice().reverse();
  let matchResult;
  let n = needles.length;
  while (n--) {
    matchResult = matchingFunction(needles[n], haystack);
    if (matchResult) break;
  }
  return elseFirst ? matchResult || haystack[0] : matchResult;
}

/**
 * If `needle` is a valid value, returns the first element in the `haystack`
 * that matches the fullName property.
 * If there's no matches and `elseFirst` is true, returns the first element
 * in the `haystack`.
 * @template {{fullName: string}} T
 * @param {string} needle The key to match
 * @param {T[]} haystack The array where to search for the object.
 * @param {boolean} [elseFirst] A flag to return the first element in case of no matching result.
 */
export function findByFullName(needle, haystack, elseFirst = false) {
  const findResult = needle
    ? haystack.find(item => item.fullName.indexOf(needle) > -1)
    : undefined;
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * If `needle` is a valid value, returns the first element in the `haystack`
 * that matches its `key` property.
 * If there's no matches and `elseFirst` is true, returns the first element
 * in the `haystack`.
 * @template {{key: string}} T
 * @param {string} needle The key to match
 * @param {T[]} haystack The array where to search for the object.
 * @param {boolean} [elseFirst] A flag to return the first element in case of no matching result.
 */
export function findByKey(needle, haystack, elseFirst = false) {
  const findResult = needle ? haystack.find(item => item.key === needle) : undefined;
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * if `needle` is a valid value, returns the first element in the `haystack`
 * that matches the LevelLike properties of `needle`.
 * If there's no matches and `elseFirst` is true, returns the first element
 * in the `haystack`.
 * @template {LevelLike} T
 * @param {LevelLike} needle
 * @param {T[]} haystack
 * @param {boolean} [elseFirst]
 */
export function findByLevelLike(needle, haystack, elseFirst = false) {
  const findResult = needle
    ? haystack.find(item => isSameLevel(needle, item))
    : undefined;
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * If `needle` is a valid value, returns the first element in the `haystack`
 * that matches the name property.
 * If there's no matches and `elseFirst` is true, returns the first element
 * in the `haystack`.
 * @template {{name: string}} T
 * @param {string} needle The key to match
 * @param {T[]} haystack The array where to search for the object.
 * @param {boolean} [elseFirst] A flag to return the first element in case of no matching result.
 */
export function findByName(needle, haystack, elseFirst = false) {
  const findResult = needle ? haystack.find(item => item.name === needle) : undefined;
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * Returns the first number it finds in a `string`, else returns `elseValue`.
 * @param {string} string The string to test
 * @param {number} [elseValue] A value to return in case the string doesn't contain any
 */
export function findFirstNumber(string, elseValue) {
  const match = `${string}`.match(/[0-9\.\,]+/);
  return match ? Number.parseFloat(match[0]) : elseValue || 0;
}

/**
 * Returns the value of the highest timeLevel value in the dataset,
 * but lower or equal than the current time.
 * @param {number[]} timelist An array with time-related members
 */
export function findHigherCurrentPeriod(timelist) {
  // TODO: prepare it to handle months, days, etc
  const now = new Date();
  const currentTime = now.getFullYear();
  return sortNumbers(timelist, false).find(time => time <= currentTime) || timelist[0];
}

/**
 * @param {LevelItem[]} levels
 * @param {LevelRef} levelRef
 * @returns {LevelItem}
 */
export function findLevelByGroup(levels, {dimension, hierarchy, level}) {
  const finderFn = lvl =>
    lvl.dimension === dimension && lvl.hierarchy === hierarchy && lvl.name === level;
  const trebuchet = () => {
    throw new Error(`Group isn't available in the list of levels provided.`);
  };
  return levels.find(finderFn) || trebuchet();
}

/**
 * @param {CubeItem} cube
 * @param {LevelItem} level
 */
export function findParentHierarchy(cube, level) {
  for (let dimension, d = 0; (dimension = cube.dimensions[d]); d++) {
    for (let hierarchy, h = 0; (hierarchy = dimension.hierarchies[h]); h++) {
      if (hierarchy.levels.includes(level)) {
        return hierarchy;
      }
    }
  }
  throw new Error(
    `Couldn't find parent hierarchy of level ${level.uri} in cube ${cube.uri}`
  );
}

/**
 * Filter elements in a `list` based on a `query` string applied against the
 * `property` of each element.
 * @template T
 * @param {T[]} list
 * @param {string} query
 * @param {keyof T} property
 */
export function fuzzySearch(list, query, property) {
  const escapedQuery = escapeRegExp(query);
  const tester = new RegExp(escapedQuery, "i");
  return list.filter(item => tester.test(`${item[property]}`));
}

/**
 * Finds the right measure, associated to the cube the user picks,
 * from the same table as the original `measure`.
 * @param {MeasureItem} measure The initial measure to make the selection
 * @param {Record<string, MeasureItem[]>} tableMeasureMap The general tableId map
 * @param {CubeItem[]} cubes The general cube list
 * @param {(cubes: CubeItem[]) => CubeItem} selectorFn The cube selector function
 */
export function userTableIdMeasure(measure, tableMeasureMap, cubes, selectorFn) {
  // get the measures associated to the table
  const tableMeasures = tableMeasureMap[`${measure.tableId}`] || [];
  // find their cubes
  const tableCubes = tableMeasures.map(ms => cubes.find(cb => cb.name === ms.cube));
  // let the user pick the right cube
  // @ts-ignore
  const pickedCube = selectorFn(tableCubes);
  // this is to make sure the user doesn't return something other than a cube from the options
  const pickedCubeIndex = tableCubes.indexOf(pickedCube);
  return pickedCubeIndex > -1 ? tableMeasures[pickedCubeIndex] : measure;
}
