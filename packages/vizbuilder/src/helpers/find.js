import {isSameLevel} from "./validation";

/**
 * If `needle` is a valid value, returns the first element in the `haystack`
 * that matches the annotation._key property.
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
 * Returns the first number it finds in a `string`, else returns `elseValue`.
 * @param {string} string The string to test
 * @param {number} elseValue A value to return in case the string doesn't contain any
 */
export function findFirstNumber(string, elseValue) {
  const match = `${string}`.match(/[0-9\.\,]+/);
  return match ? Number.parseFloat(match[0]) : elseValue;
}

/**
 * Looks for an element of `needles` in `haystack`, using the `matchingFunction`.
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
