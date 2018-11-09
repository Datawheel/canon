import sort from "fast-sort";
import {unique} from "shorthash";
import yn from "yn";

import * as api from "./api";
import {TooMuchData} from "./errors";
import {generateBaseState, queryBuilder, queryConverter} from "./query";
import {
  classifyMeasures,
  findByName,
  getDefaultGroup,
  getIncludedMembers
} from "./sorting";
import {isValidDimension} from "./validation";

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

    if (yn(cbAnnotations.hide_in_ui)) {
      cubes.splice(nCbs, 1);
      continue;
    }

    const cbName = cube.caption || cube.name;
    const cbTableId = cbAnnotations.table_id;
    const cbTopic = cbAnnotations.topic || "Other";
    const cbSubtopic = cbAnnotations.subtopic;
    const selectorKey = `${cbTopic}_${cbSubtopic}_`;
    // const sourceName = cbAnnotations.source_name;
    const datasetName = cbAnnotations.dataset_name;
    const cbTagline = cbAnnotations.source_name || "";
    const cbMeta = [cbAnnotations.source_name, cbAnnotations.dataset_name]
      .filter(Boolean)
      .join("_");

    cbAnnotations._key = unique(cbName);

    const cbLevelNameSet = new Set();
    let nDim = cube.dimensions.length;
    while (nDim--) {
      const dimension = cube.dimensions[nDim];
      const dimValid = isValidDimension(dimension);
      const keyPrefix = `${cbName} ${dimension.name} `;

      dimension.annotations._key = unique(keyPrefix);

      let nHie = dimension.hierarchies.length;
      while (nHie--) {
        const hierarchy = dimension.hierarchies[nHie];

        let nLvl = hierarchy.levels.length;
        while (nLvl--) {
          const level = hierarchy.levels[nLvl];
          level.annotations._key = unique(
            `${keyPrefix} ${hierarchy.name} ${level.name}`
          );

          if (nLvl > 0 && dimValid) {
            cbLevelNameSet.add(level.name);
          }
        }
      }
    }

    const cbLevelNameList = Array.from(cbLevelNameSet);
    const levelKeys = cbLevelNameList.join("_");

    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      const measureLabel = measure.caption || measure.name;
      const msAnnotations = measure.annotations;

      msAnnotations._key = unique(`${cbName} ${measure.name}`);
      msAnnotations._cb_datasetName = datasetName;
      msAnnotations._cb_name = cbName;
      msAnnotations._cb_table_id = cbTableId;
      msAnnotations._cb_tagline = cbTagline;
      msAnnotations._cb_topic = cbTopic;
      msAnnotations._cb_subtopic = cbSubtopic;
      // msAnnotations._cb_sourceName = sourceName;
      msAnnotations._sortKey = selectorKey + measureLabel;
      msAnnotations._searchIndex = `${selectorKey}${measureLabel}_${cbMeta}_${levelKeys}`;
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

    const {measures, measureMap} = classifyMeasures(cubes);
    const measure = findByName(params.defaultMeasure, measures, true);

    const newState = generateBaseState(cubes, measure);

    const newOptions = newState.options;
    newOptions.cubes = cubes;
    newOptions.measures = measures;
    newOptions.measureMap = measureMap;

    const newQuery = newState.query;
    newQuery.groups = getDefaultGroup(params.defaultGroup, newOptions.levels);

    return newState;
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
 * @param {Query} query The Vizbuilder's state query object
 * @returns {Promise<QueryResults>}
 */
export function fetchQuery(datacap, query) {
  const mondrianQuery = queryBuilder(queryConverter(query));
  const measureName = query.measure.name;
  const timeLevelName = query.timeLevel;
  return api.query(mondrianQuery).then(result => {
    const dataset = (result.data || {}).data || [];
    sort(dataset).desc(measureName);
    const members = getIncludedMembers(mondrianQuery, dataset);

    let dataAmount = dataset.length;
    if (Array.isArray(members[timeLevelName])) {
      dataAmount *= 1 / members[timeLevelName].length;
    }
    if (dataAmount > datacap) {
      throw new TooMuchData(mondrianQuery, dataAmount);
    }

    return {dataset, members};
  });
}

/**
 * @typedef QueryResults
 * @prop {object[]} dataset The dataset for the current query
 * @prop {object} members An object with the list of current member names for the current drilldowns. Is the output of the `getIncludedMembers` function.
 */
