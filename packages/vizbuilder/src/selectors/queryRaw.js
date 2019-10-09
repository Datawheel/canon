import {createSelector} from "reselect";
import {measureIteratorFactory} from "../helpers/arrays";
import {selectCubesState, selectQueryState} from "./state";

export const selectActiveChart = createSelector(
  selectQueryState,
  query => query.activeChart
);

export const selectGroups = createSelector(selectQueryState, query => query.groups);

export const selectFilters = createSelector(selectQueryState, query => query.filters);

export const selectShowConfInt = createSelector(
  selectQueryState,
  query => query.showConfInt
);

export const selectTimePeriod = createSelector(
  selectQueryState,
  query => query.timePeriod
);

export const selectMeasure = createSelector(
  [selectQueryState, selectCubesState],
  ({measure: measureUri}, cubes) => {
    const iterator = measureIteratorFactory(cubes);
    while (measureUri) {
      const step = iterator.next();
      if (step.done) break;
      const measure = step.value;
      if (measure.uri === measureUri) {
        return measure;
      }
    }
  }
);

export const selectCube = createSelector(
  [selectCubesState, selectMeasure],
  (cubes, measure) => {
    if (measure) {
      const {cube: cubeUri} = measure;
      return cubes.find(cube => cube.uri === cubeUri);
    }
  }
);
