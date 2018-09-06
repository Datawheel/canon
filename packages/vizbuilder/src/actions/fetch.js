import {unique} from "shorthash";
import * as api from "../helpers/api";
import {
  findByKey,
  findByName,
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  getValidMeasures,
  matchDefault,
  preventHierarchyIncompatibility,
  reduceLevelsFromDimension,
  removeDuplicateLevels
} from "../helpers/sorting";

/**
 * Prepares the array of cubes that will be used in the vizbuilder.
 * Specifically, filters the cubes that aren't for public use, and injects
 * information about the parent cube into the annotations of its measures
 * and levels.
 * @param {Cube[]} cubes An array of cubes. This array is modified in place.
 */
export function injectCubeInfoOnMeasure(cubes) {
  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];
    const cbAnnotations = cube.annotations;

    if (cbAnnotations.hide_in_ui) {
      cubes.splice(nCbs, 1);
      continue;
    }

    const cbName = cube.caption || cube.name;
    const cbTopic = cbAnnotations.topic || "Other";
    const cbSubtopic = cbAnnotations.subtopic;
    const selectorKey = `${cbTopic}_${cbSubtopic}_`;
    const sourceName = cbAnnotations.source_name;

    cbAnnotations._key = unique(cbName);

    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      const measureLabel = measure.caption || measure.name;
      const msAnnotations = measure.annotations;

      msAnnotations._key = unique(`${cbName} ${measure.name}`);
      msAnnotations._cb_name = cbName;
      msAnnotations._cb_topic = cbTopic;
      msAnnotations._cb_subtopic = cbSubtopic;
      msAnnotations._cb_sourceName = sourceName;
      msAnnotations._selectorKey = selectorKey + measureLabel;
    }

    let nDim = cube.dimensions.length;
    while (nDim--) {
      const dimension = cube.dimensions[nDim];
      const keyPrefix = `${cbName} ${dimension.name} `;

      let nHie = dimension.hierarchies.length;
      while (nHie--) {
        const hierarchy = dimension.hierarchies[nHie];

        let nLvl = hierarchy.levels.length;
        while (nLvl--) {
          const level = hierarchy.levels[nLvl];

          level.annotations._key = unique(keyPrefix + level.name);
        }
      }
    }
  }
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
      const defaultLevel = [].concat(initialQuery.defaultLevel).reverse();

      if ("defaultDimension" in initialQuery) {
        const defaultDimension = [].concat(initialQuery.defaultDimension).reverse();
        dimension = matchDefault(findByName, dimensions, defaultDimension, true);
        levels = reduceLevelsFromDimension(levels, dimension);
        drilldown = matchDefault(findByName, levels, defaultLevel, true);
      }
      else {
        drilldown = matchDefault(findByName, drilldowns, defaultLevel, true);
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
 * @typedef {any} InitialQueryState
 * @prop {string} [defaultDimension] Initial dimension set by the user
 * @prop {string} [defaultLevel] Initial level for drilldown set by the user
 * @prop {string} [defaultMeasure] Initial measure set by the user
 * @prop {string} [ms] Initial measure key, parsed from the permalink
 * @prop {string} [dd] Initial drilldown key, parsed from the permalink
 */
