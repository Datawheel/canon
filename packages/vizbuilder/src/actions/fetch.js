import * as api from "../helpers/api";
import {
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  getValidMeasures,
  injectCubeInfoOnMeasure,
  reduceLevelsFromDimension,
  preventHierarchyIncompatibility,
  removeDuplicateLevels
} from "../helpers/sorting";

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
 * Retrieves the cube list and prepares the initial state for the first query
 * @param {InitialQueryState} initialQuery An object with initial state parameters
 */
export function fetchCubes(initialQuery) {
  return api.cubes().then(cubes => {
    initialQuery = initialQuery || {};
    injectCubeInfoOnMeasure(cubes);

    const measures = getValidMeasures(cubes);
    const measure = findByKey(initialQuery.ms, measures) || findByName(initialQuery.defaultMeasure, measures, true);

    const cubeName = measure.annotations._cb_name;
    const cube = cubes.find(cube => cube.name === cubeName);
    const moe = getMeasureMOE(cube, measure);
    const timeDrilldown = getTimeDrilldown(cube);

    const dimensions = getValidDimensions(cube);
    const drilldowns = getValidDrilldowns(dimensions);

    let dimension;
    // Check first for URL-based initial state
    let drilldown = findByKey(initialQuery.dd, drilldowns);
    let levels = [];

    if (drilldown) {
      dimension = drilldown.hierarchy.dimension;
      levels = reduceLevelsFromDimension(levels, dimension);
    }
    else {
      if ("defaultDimension" in initialQuery) {
        dimension = findByName(initialQuery.defaultDimension, dimensions, true);
        levels = reduceLevelsFromDimension(levels, dimension);
        drilldown = findByName(initialQuery.defaultLevel, levels, true);
      }
      else {
        drilldown = findByName(initialQuery.defaultLevel, drilldowns, true);
        dimension = drilldown.hierarchy.dimension;
        levels = reduceLevelsFromDimension(levels, dimension);
      }
    }

    preventHierarchyIncompatibility(drilldowns, drilldown);
    removeDuplicateLevels(levels);

    return {
      options: {cubes, measures, dimensions, drilldowns, levels},
      query: {
        cube,
        measure,
        moe,
        dimension,
        drilldown,
        timeDrilldown,
        conditions: []
      },
      queryOptions: {
        parents: drilldown.depth > 1
      }
    };
  });
}

/**
 * Retrieves all the members for a certain Level.
 * @param {Level} level A mondrian-rest-client Level object
 */
export function fetchMembers(level) {
  this.setState({loading: true, members: []}, () =>
    api.members(level).then(members => this.setState({loading: false, members}))
  );
}

/**
 * Retrieves the dataset for the query in the current Vizbuilder state.
 */
export function fetchQuery() {
  const {query, queryOptions} = this.props;
  return api.query({
    ...query,
    options: queryOptions
  });
}

/**
 * @typedef {InitialQueryState}
 * @prop {string?} defaultDimension Initial dimension set by the user
 * @prop {string?} defaultLevel Initial level for drilldown set by the user
 * @prop {string?} defaultMeasure Initial measure set by the user
 * @prop {string?} ms Initial measure key, parsed from the permalink
 * @prop {string?} dd Initial drilldown key, parsed from the permalink
 */
