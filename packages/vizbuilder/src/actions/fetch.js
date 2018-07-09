import * as api from "../helpers/api";
import {
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  getValidMeasures,
  injectCubeInfoOnMeasure,
  reduceLevelsFromDimension
} from "../helpers/sorting";

/**
 * These functions should be handled/called with `this`
 * as the component where they are used.
 */

const findByKeyOrFirst = (key, array) =>
  key
    ? array.find(item => item.annotations._key === key) || array[0]
    : array[0];

export function fetchCubes(locationQuery) {
  return api.cubes().then(cubes => {
    locationQuery = locationQuery || {};
    injectCubeInfoOnMeasure(cubes);

    const measures = getValidMeasures(cubes);
    const firstMeasure = findByKeyOrFirst(locationQuery.ms, measures);
    const firstCubeName = firstMeasure.annotations._cb_name;
    const firstCube = cubes.find(cube => cube.name === firstCubeName);
    const firstMoe = getMeasureMOE(firstCube, firstMeasure);
    const timeDrilldown = getTimeDrilldown(firstCube);

    const dimensions = getValidDimensions(firstCube);
    const drilldowns = getValidDrilldowns(dimensions);

    let drilldown, firstDimension, levels;
    if ("dd" in locationQuery) {
      drilldown = findByKeyOrFirst(locationQuery.dd, drilldowns);
      firstDimension = drilldown.hierarchy.dimension;
      levels = reduceLevelsFromDimension([], firstDimension);
    }
    else {
      firstDimension = dimensions[0];
      levels = reduceLevelsFromDimension([], firstDimension);
      drilldown = levels[0];
    }

    return {
      options: {cubes, measures, dimensions, drilldowns, levels},
      query: {
        cube: firstCube,
        measure: firstMeasure,
        moe: firstMoe,
        dimension: firstDimension,
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

export function fetchMembers(level) {
  return api.members(level).then(members => this.setState({members}));
}

export function fetchQuery() {
  const {query, queryOptions} = this.props;
  return api.query({
    ...query,
    options: queryOptions
  });
}
