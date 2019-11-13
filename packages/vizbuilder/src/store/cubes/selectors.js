import sort from "fast-sort";
import keyBy from "lodash/keyBy";
import {createSelector} from "reselect";
import {isValidDimension, isValidMeasure} from "../../helpers/validation";
import {selectIsGeomapMode} from "../instance/selectors";

/** @type {(state: GeneralState) => CubesState} */
export const selectCubeMap = state => state.vizbuilder.cubes;

/**
 * Returns the list of cubes available to the current vizbuilder instance.
 */
export const selectCubeList = createSelector(selectCubeMap, map => Object.values(map));

/**
 * Returns the full list of valid available dimensions to the current vizbuilder
 * instance. Depends on the list of cubes available.
 * The list is returned in DimensionItem format.
 */
export const selectDimensionList = createSelector(
  [selectCubeList, selectIsGeomapMode],
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

/**
 * Returns the list of measures available to the current vizbuilder instance.
 * Depends on the list of cubes available.
 *
 * @returns {MeasureItem[]}
 */
export const selectMeasureList = createSelector(
  [selectCubeList, selectIsGeomapMode],
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
 * Returns a map of MeasureItem, whose keys are the `MeasureItem.uri` property.
 */
export const selectMeasureMap = createSelector(selectMeasureList, measures =>
  keyBy(measures, i => i.uri)
);

/**
 * Returns a map of table names with an array of associated measures
 * for each table name.
 */
export const selectMeasureMapByTable = createSelector(selectMeasureList, measures => {
  /** @type {Record<string, MeasureItem[]>} */
  const tableMeasureMap = {};

  for (let measure, m = 0; (measure = measures[m]); m++) {
    const measureTableId = measure.tableId;
    if (measureTableId) {
      const target = tableMeasureMap[measureTableId] || [];
      target.push(measure);
      tableMeasureMap[measureTableId] = target;
    }
  }

  return tableMeasureMap;
});
