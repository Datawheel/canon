import {createSelector} from "reselect";
import {selectMeasureList} from "./listsRaw";
import {selectCube, selectMeasure} from "./queryRaw";
import {levelIteratorFactory} from "../helpers/arrays";
import {selectIsGeomapMode} from "./props";

/**
 * Returns a map of table names with an array of associated measures
 * for each table name.
 */
export const selectMeasureMapByTable = createSelector(selectMeasureList, measures => {
  /** @type {{[measureTableId: string]: MeasureItem[]}} */
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

/**
 * Returns a list of measures for the table name of the current measure
 */
export const selectMeasureListByTable = createSelector(
  [selectMeasure, selectMeasureMapByTable],
  (measure, tableMeasureMap) =>
    measure ? tableMeasureMap[`${measure.tableId}`] || [] : []
);

/**
 * Returns the list of sibling measures of the current state.query.measure,
 * respect to its parent cube.
 * The list is returned in MeasureItem format.
 */
export const selectMeasureListByCube = createSelector(
  [selectCube, selectIsGeomapMode],
  (cube, isGeomapMode) =>
    cube.measures.filter(
      measure => !(isGeomapMode && measure.hideInMap) && !measure.hideInUi
    )
);

/**
 * Returns the list of levels for the cube currently selected.
 */
export const selectLevelListByCube = createSelector(
  [selectCube, selectIsGeomapMode],
  (cube, isGeomapMode) => {
    const levels = [];
    if (cube) {
      const iterator = levelIteratorFactory(cube.dimensions);
      while (true) {
        const step = iterator.next();
        if (step.done) break;
        const level = step.value;
        if (!(isGeomapMode && level.hideInMap) && !level.hideInUi) {
          levels.push(step.value);
        }
      }
    }
    return levels;
  }
);
