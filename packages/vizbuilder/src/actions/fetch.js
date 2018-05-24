import * as api from "../helpers/api";
import {getValidDrilldowns, addTimeDrilldown} from "../helpers/sorting";

/**
 * These functions should be handled/called with this as the component where they are used.
 */

export function fetchCubes() {
  const {queryUpdate, optionsUpdate} = this.context;

  return api.cubes().then(cubes => {
    const firstCube = cubes[0];
    const measures = cubes.reduce((sum, cube) => {
      for (const measure of cube.measures) {
        measure.annotations._cube = cube.name;
        sum.push(measure);
      }
      return sum;
    }, []);
    const levels = getValidDrilldowns(firstCube);
    const drilldowns = addTimeDrilldown(levels.slice(0, 1), firstCube);

    return Promise.all([
      optionsUpdate({cubes, measures, levels}),
      queryUpdate({
        cube: firstCube,
        measure: firstCube.measures[0],
        drilldowns
      })
    ]);
  });
}

export function fetchMembers(level) {
  const {optionsUpdate} = this.context;

  return api.members(level).then(members =>
    optionsUpdate({
      members: {
        [level.fullName]: members
      }
    })
  );
}

export function fetchQuery() {
  const {query} = this.props;
  const {datasetUpdate} = this.context;

  return api.query(query).then(result => {
    const data = result.data || {};
    return datasetUpdate(data.data);
  });
}
