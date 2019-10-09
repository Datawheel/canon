import {userTableIdMeasure} from "../helpers/sorting";
import {
  selectMeasureListByTable,
  selectMeasureMapByTable
} from "../selectors/listsDerived";
import {selectPermalink} from "../selectors/permalink";
import {selectCube, selectMeasure} from "../selectors/queryRaw";
import {selectCubesState, selectQueryState} from "../selectors/state";
import {doMeasureUpdate} from "../store/query/actions";
import {
  CORE_UPDATE_DATASET,
  CORE_UPDATE_MEASURE,
  CORE_UPDATE_PERMALINK,
  doValidateParams
} from "./actions";

export default {
  /**
   * Handles the changes of a measure from the same table but different cube
   * @param {import("..").MiddlewareActionParams<string>} param0
   */
  [CORE_UPDATE_DATASET]: ({action, dispatch, getState}) => {
    const cubeName = action.payload;
    const state = getState();

    const measures = selectMeasureListByTable(state);
    const measure = measures.find(ms => ms.cube === cubeName);
    if (measure) {
      dispatch(doMeasureUpdate(measure.uri));
      dispatch(doValidateParams());
    }
  },

  /**
   * This action must be used when there's a change in the UI measure selector.
   * It checks the new measure belongs to the same table as the previous one,
   * or uses the defaultTable function to pick it.
   * Then revalidate the other params.
   *
   * @param {import("..").MiddlewareActionParams<{measure: MeasureItem, defaultTable?: ((cubes: CubeItem[]) => CubeItem)}>} param0
   */
  [CORE_UPDATE_MEASURE]: ({action, dispatch, getState}) => {
    let {measure, defaultTable} = action.payload;
    const state = getState();

    if (measure.tableId && defaultTable) {
      const currentMeasure = selectMeasure(state);
      const measureTables = selectMeasureMapByTable(state);
      if (currentMeasure && currentMeasure.tableId) {
        const tableMeasures = measureTables[measure.tableId];
        const currentCube = selectCube(state);
      }
      const cubes = selectCubesState(state);
      measure = userTableIdMeasure(measure, measureTables, cubes, defaultTable);
    }

    dispatch(doMeasureUpdate(measure.uri));
    dispatch(doValidateParams());
  },

  /**
   * Handles the update of the url search params in the browser interface.
   *
   * @param {import("..").MiddlewareActionParams<undefined>} param0
   */
  [CORE_UPDATE_PERMALINK]: ({getState}) => {
    const state = getState();

    const queryState = selectQueryState(state);
    const permalink = selectPermalink(state);

    if (window.location.search.slice(1) !== permalink) {
      console.groupCollapsed("Permalink changed");
      console.log(queryState);
      console.groupEnd();

      const nextLocation = `${window.location.pathname}?${permalink}`;
      window.history.pushState(queryState, "", nextLocation);
    }

    return Promise.resolve();
  }
};
