import sort from "fast-sort";
import union from "lodash/union";

import {isTimeDimension} from "./validation";

/**
 * Completes the remaining items from `state` using the values from a `searchQuery` object.
 * Gives priority to permalink keys, and if there's no matches, uses user default_ keys.
 * @param {object} state A Vizbuilder's partial state. Requires at least the `state.query` (can be empty), `state.options.dimensions`, and `state.options.drilldowns}` objects;
 * @param {ExternalQueryParams} params A default/permalink parameter object. `keys` map to `item.annotations._key`, `defaultKeys` map to `item.name`.
 */
export function finishBuildingStateFromParameters(state, params) {
  const {dimensions, drilldowns} = state.options;

  let dimension, drilldown;
  let levels = [];

  drilldown = findByKey(params.level, drilldowns);
  if (drilldown) {
    dimension = drilldown.hierarchy.dimension;
    levels = reduceLevelsFromDimension(levels, dimension);
    removeDuplicateLevels(levels);
  }
  else {
    const defaultLevel = params.defaultLevel || [];
    const defaultDimension = params.defaultDimension || [];

    dimension = findByKey(params.dimension, dimensions);
    if (dimension) {
      levels = reduceLevelsFromDimension(levels, dimension);
      removeDuplicateLevels(levels);
      drilldown = matchDefault(findByName, levels, defaultLevel, true);
    }
    else {
      if (defaultDimension.length > 0) {
        dimension = matchDefault(findByName, dimensions, defaultDimension, true);
        levels = reduceLevelsFromDimension(levels, dimension);
        removeDuplicateLevels(levels);
        drilldown = matchDefault(findByName, levels, defaultLevel, true);
      }
      else {
        drilldown = matchDefault(findByName, drilldowns, defaultLevel, true);
        dimension = drilldown.hierarchy.dimension;
        levels = reduceLevelsFromDimension(levels, dimension);
        removeDuplicateLevels(levels);
      }
    }
  }

  preventHierarchyIncompatibility(drilldowns, drilldown);

  state.query.dimension = dimension;
  state.query.drilldown = drilldown;
  state.query.optionsParents = drilldown.depth > 1;
  state.options.levels = levels;

  return state;
}

/**
 * If `needle` is a valid value, returns the first element in the `haystack`
 * that matches the annotation._key property.
 * If there's no matches and `elseFirst` is true, returns the first element
 * in the `haystack`.
 * @param {string} needle The key to match
 * @param {any[]} haystack The array where to search for the object.
 * @param {boolean?} elseFirst A flag to return the first element in case of no matching result.
 */
export function findByKey(needle, haystack, elseFirst = false) {
  const findResult = needle ? haystack.find(item => item.annotations._key === needle) : undefined;
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * If `needle` is a valid value, returns the first element in the `haystack`
 * that matches the name property.
 * If there's no matches and `elseFirst` is true, returns the first element
 * in the `haystack`.
 * @param {string} needle The key to match
 * @param {any[]} haystack The array where to search for the object.
 * @param {boolean?} elseFirst A flag to return the first element in case of no matching result.
 */
export function findByName(needle, haystack, elseFirst = false) {
  const findResult = needle ? haystack.find(item => item.name === needle) : undefined;
  return elseFirst ? findResult || haystack[0] : findResult;
}

/**
 * Looks for an element of `defaults` in `haystack`, using the `matchingFunction`.
 * If `elseFirst` is true and there's no match, returns the first element in `haystack`.
 * @param {(needle, haystack) => any} matchingFunction The function to use to find the elements
 * @param {any[]} haystack The array where to search for the object
 * @param {string[]} defaults The array of default names to search for
 * @param {boolean?} elseFirst A flag to return the first element in case of no matching result
 */
export function matchDefault(matchingFunction, haystack, defaults, elseFirst) {
  let matchResult;
  let n = defaults.length;
  defaults = [].concat(defaults).reverse();
  while (n--) {
    const needle = defaults[n];
    matchResult = matchingFunction(needle, haystack);
    if (matchResult) {
      break;
    }
  }
  return elseFirst ? matchResult || haystack[0] : matchResult;
}

/**
 * Reduces a list of cubes to the measures that will be used in the vizbuilder.
 * @param {Cube[]} cubes An array of the cubes to be reduced.
 * @returns {Measure[]}
 */
export function getValidMeasures(cubes) {
  cubes = [].concat(cubes);
  const measures = [];
  const otherMeasures = [];

  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];
    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      const msAnnotations = measure.annotations;
      if (
        msAnnotations.error_for_measure === undefined &&
        msAnnotations.error_type === undefined &&
        msAnnotations.source_for_measure === undefined &&
        msAnnotations.collection_for_measure === undefined
      ) {
        if (msAnnotations._cb_topic === "Other") {
          otherMeasures.push(measure);
        }
        else {
          measures.push(measure);
        }
      }
    }
  }

  const sortingFunction = a => a.annotations._sortKey;
  const sortedMeasures = sort(measures).asc(sortingFunction);
  const sortedOther = sort(otherMeasures).asc(sortingFunction);

  return sortedMeasures.concat(sortedOther);
}

/**
 * Returns the MOE measure for a certain measure, in the full measure list
 * from the cube. If there's no MOE for the measure, returns undefined.
 * @param {Cube} cube The measure's parent cube
 * @param {*} measure The measure
 * @returns {Measure|undefined}
 */
export function getMeasureMeta(cube, measure) {
  let lci, uci, moe, collection, source;
  const measureName = RegExp(measure.name, "i");

  if (cube.measures.indexOf(measure) > -1) {
    let nMsr = cube.measures.length;
    while (nMsr--) {
      const currentMeasure = cube.measures[nMsr];
      const measureAnnotations = currentMeasure.annotations;

      const keyMoe = measureAnnotations.error_for_measure;
      const keyCollection = measureAnnotations.collection_for_measure;
      const keySource = measureAnnotations.source_for_measure;

      if (keyMoe && measureName.test(keyMoe)) {
        const errorType = measureAnnotations.error_type;

        if (errorType === "LCI") {
          lci = currentMeasure;
        } else if (errorType === "UCI") {
          uci = currentMeasure;
        } else {
          moe = currentMeasure;
        }
      }

      if (!source && keySource && measureName.test(keySource)) {
        source = currentMeasure;
      }

      if (!collection && keyCollection && measureName.test(keyCollection)) {
        collection = currentMeasure;
      }

      if (collection && ((lci && uci) || moe) && source) {
        break;
      }
    }
  }

  return {lci, uci, moe, collection, source};
}

/**
 * Returns an array with non-time dimensions from a cube.
 * @param {Cube} cube The cube where the dimensions will be reduced from
 * @returns {Dimension[]}
 */
export function getValidDimensions(cube) {
  return cube.dimensions.filter(dim => !isTimeDimension(dim));
}

/**
 * Extracts the levels from non-time dimensions, to be used as drilldowns.
 * @param {Dimension[]} dimensions The dimensions where to extract levels from.
 * @returns {Level[]}
 */
export function getValidDrilldowns(dimensions) {
  return dimensions.reduce(reduceLevelsFromDimension, []);
}

/**
 * Modifies the `array`, removing the Level elements that would cause an
 * incompatibility problem in a cut if queried with the `interestLevel` as
 * a drilldown.
 * @param {Level[]} array An array of mondrian-rest-client Levels
 * @param {Level} interestLevel The Level to test by hierarchy incompatibility
 */
export function preventHierarchyIncompatibility(array, interestLevel) {
  const interestHierarchy = interestLevel.hierarchy;
  const interestDimension = interestHierarchy.dimension;

  let n = array.length;
  while (n--) {
    const level = array[n];
    const hierarchy = level.hierarchy;
    if (
      hierarchy.dimension === interestDimension &&
      (hierarchy !== interestHierarchy || level.depth > interestLevel.depth)
    ) {
      array.splice(n, 1);
    }
  }
}

/**
 * A function to be reused in the `Array.prototype.reduce` method, to obtain
 * the valid Level elements from an array of Dimension elements.
 * @param {Dimension[]} container The target array to save the reduced elements
 * @param {Dimension} dimension The current Dimension in the iteration
 * @returns {Dimension[]}
 */
export function reduceLevelsFromDimension(container, dimension) {
  return isTimeDimension(dimension)
    ? container
    : dimension.hierarchies.reduce((container, hierarchy) => container.concat(hierarchy.levels.slice(1)), container);
}

/**
 * Adds a Level object to a list of Level objects, and removes duplicate elements.
 * @param {Level[]} array Target Level array
 * @param {Level} drilldown Level object to add
 */
export function joinDrilldownList(array, drilldown) {
  array = array.filter(dd => dd.hierarchy !== drilldown.hierarchy);
  drilldown = [].concat(drilldown || []);
  return sort(union(array, drilldown)).asc(
    a => a.hierarchy.dimension.dimensionType
  );
}

/**
 * Checks for duplicate levels, based on their names.
 * If a duplicate is found, the level whose hierarchy name
 * is different to their own name is removed.
 * @see Issue#136 on {@link https://github.com/Datawheel/canon/issues/136 | GitHub}
 * @param {Level[]} array The level array to filter
 */
export function removeDuplicateLevels(array) {
  const nameList = array.map(lvl => lvl.name);
  let n = array.length;
  while (n--) {
    const currName = nameList[n];
    if (
      // the current element's name is more than once on the list
      nameList.indexOf(currName) !== nameList.lastIndexOf(currName) &&
      // and its hierarchy's name is different to its own name
      array[n].hierarchy.name !== currName
    ) {
      nameList.splice(n, 1);
      array.splice(n, 1);
    }
  }
}

/**
 * Extracts a time-type Dimension from a Cube object. If not found,
 * returns undefined.
 * @param {Cube} cube The Cube object to extract the time Dimension from
 * @returns {Dimension|undefined}
 */
export function getTimeDrilldown(cube) {
  const timeDim =
    cube.timeDimension ||
    cube.dimensionsByName.Date ||
    cube.dimensionsByName.Year;
  if (timeDim) {
    const timeHie = timeDim.hierarchies.slice(-1).pop();
    if (timeHie) {
      return timeHie.levels.slice(1, 2).pop();
    }
  }
  return undefined;
}

/**
 * Returns an object where the keys are the current query's drilldowns
 * and its values are arrays with the values available in the current dataset.
 * @param {Query} query A mondrian-rest-client Query object
 * @param {Array<any>} dataset The result dataset for the query object passed along.
 */
export function getIncludedMembers(query, dataset) {
  return query.getDrilldowns().reduce((members, dd) => {
    const key = dd.name;
    const set = {};

    let n = dataset.length;
    while (n--) {
      const value = dataset[n][key];
      set[value] = 0;
    }

    members[key] = Object.keys(set).sort();
    return members;
  }, {});
}

/**
 * Generates a sorting function to be used in `Array.prototype.sort`,
 * based on a certain key.
 * @param {string} key The key to the property to be used as comparison string
 */
export function sortByCustomKey(key) {
  return (a, b) => `${a[key]}`.localeCompare(`${b[key]}`);
}
