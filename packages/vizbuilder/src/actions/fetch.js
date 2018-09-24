import {unique} from "shorthash";
import * as api from "../helpers/api";
import {
  findByName,
  finishBuildingStateFromParameters,
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  getValidMeasures,
  getMeasureSource
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

      dimension.annotations._key = unique(keyPrefix);

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
 * @param {ExternalQueryParams} params An object with initial state parameters
 */
export function fetchCubes(params) {
  return api.cubes().then(cubes => {
    injectCubeInfoOnMeasure(cubes);

    const measures = getValidMeasures(cubes);
    const measure = findByName(params.defaultMeasure, measures, true);

    const cubeName = measure.annotations._cb_name;
    const cube = cubes.find(cube => cube.name === cubeName);

    const dimensions = getValidDimensions(cube);
    const drilldowns = getValidDrilldowns(dimensions);
    const sources = getMeasureSource(cube, measure);

    const state = {
      options: {cubes, measures, dimensions, drilldowns},
      query: {
        cube,
        measure,
        moe: getMeasureMOE(cube, measure),
        collection: sources.collectionMeasure,
        source: sources.sourceMeasure,
        timeDrilldown: getTimeDrilldown(cube),
        activeChart: params.enlarged || null,
        conditions: []
      }
    };

    return finishBuildingStateFromParameters(state, params);
  });
}

/**
 * Retrieves all the members for a certain Level.
 * @param {Level} level A mondrian-rest-client Level object
 */
export function fetchMembers(level) {
  return api.members(level);
}

/**
 * Retrieves the dataset for the query in the current Vizbuilder state.
 */
export function fetchQuery() {
  const {query, queryOptions} = this.state;
  return api.query({
    ...query,
    options: queryOptions
  });
}
