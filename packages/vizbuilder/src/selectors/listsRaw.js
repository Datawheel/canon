import sort from "fast-sort";
import {createSelector} from "reselect";
import {isValidMeasure, isValidDimension} from "../helpers/validation";
import {selectCubesState} from "./state";
import {selectIsGeomapMode} from "./props";

/**
 * Returns the list of measures available to the current vizbuilder instance.
 * Depends on the list of cubes available.
 * The list is returned in MeasureItem format.
 */
export const selectMeasureList = createSelector(
  [selectCubesState, selectIsGeomapMode],
  (cubes, isGeomapMode) => {
    /** @type {MeasureItem[]} */
    const measures = [];

    const topicMeasures = measures.slice();
    const otherMeasures = measures.slice();

    let c = cubes.length;
    while (c--) {
      const cube = cubes[c];

      let m = cube.measures.length;
      while (m--) {
        const measure = cube.measures[m];
        const {topic} = measure;
        const hideInMap = isGeomapMode && measure.hideInMap;

        if (isValidMeasure(measure) && !hideInMap) {
          const hasTopic = topic && topic !== "Other";
          (hasTopic ? topicMeasures : otherMeasures).push(measure);
        }
      }
    }

    return measures.concat(
      sort(topicMeasures).asc(measure => measure.sortKey),
      sort(otherMeasures).asc(measure => measure.sortKey)
    );
  }
);

/**
 * Returns the full list of valid available dimensions to the current vizbuilder
 * instance. Depends on the list of cubes available.
 * The list is returned in DimensionItem format.
 */
export const selectDimensionList = createSelector(
  [selectCubesState, selectIsGeomapMode],
  (cubes, isGeomapMode) => {
    /** @type {DimensionItem[]} */
    const dimensions = [];

    let c = cubes.length;
    while (c--) {
      const cube = cubes[c];

      let d = cube.dimensions.length;
      while (d--) {
        const dimension = cube.dimensions[d];
        const hideInMap = isGeomapMode && dimension.hideInMap;

        if (isValidDimension(dimension) && !hideInMap) {
          dimensions.push(dimension);
        }
      }
    }

    return dimensions;
  }
);
