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
 * @param {boolean?} elseFirst A flag to return the first element in case of no matching result.
 */
export function findByFullName(needle, haystack, elseFirst = false) {
  const findResult = haystack.find(item => item.fullName.indexOf(needle) > -1);
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * Looks for an element of `needles` in `haystack`, using the `matchingFunction`.
 * If `elseFirst` is true and there's no match, returns the first element in `haystack`.
 * @template T
 * @param {(needle: string, haystack: T[]) => T | undefined} matchingFunction The function to use to find the elements
 * @param {T[]} haystack The array where to search for the object
 * @param {string[]} needles The array of default names to search for
 * @param {boolean} [elseFirst] A flag to return the first element in case of no matching result
 */
export function multiFinder(matchingFunction, needles, haystack, elseFirst) {
  needles = needles.slice().reverse();
  let matchResult;
  let n = needles.length;
  while (n--) {
    matchResult = matchingFunction(needles[n], haystack);
    if (matchResult) break;
  }
  return elseFirst ? matchResult || haystack[0] : matchResult;
}
