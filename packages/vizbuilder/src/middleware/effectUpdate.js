import shuffle from "lodash/shuffle";
import {userTableIdMeasure} from "../helpers/find";
import {structFilter, structGroup} from "../helpers/structs";
import {selectCubeList, selectMeasureMapByTable} from "../store/cubes/selectors";
import {selectInstanceParams} from "../store/instance/selectors";
import {loadHandlers} from "../store/loading/actions";
import {doFilterUpdate, doGroupUpdate, doMeasureUpdate} from "../store/query/actions";
import {
  selectCube,
  selectGroupDimensionList,
  selectLevelListForCube,
  selectMeasure,
  selectMeasureListForCube,
  selectMeasureListForTable,
  selectPermalink,
  selectQueryState
} from "../store/query/selectors";
import {
  CORE_CREATE_FILTER,
  CORE_CREATE_GROUP,
  CORE_RUNQUERY,
  CORE_UPDATE_DATASET,
  CORE_UPDATE_MEASURE,
  CORE_UPDATE_PERMALINK,
  doRunQueryCore,
  doRunQueryOLAP,
  doUpdatePermalink,
  doValidateParams
} from "./actions";

export default {

  /**
   * Handles the addition of a new FilterItem to the UI.
   * @param {import("../types").MiddlewareActionParams<undefined>} param0
   */
  [CORE_CREATE_FILTER]: ({dispatch, getState}) => {
    const state = getState();
    const measures = selectMeasureListForCube(state);
    const filter = structFilter({measure: measures[0].name});
    dispatch(doFilterUpdate(filter));
  },

  /**
   * Handles the addition of a new GroupItem to the UI.
   * @param {import("../types").MiddlewareActionParams<undefined>} param0
   */
  [CORE_CREATE_GROUP]: ({dispatch, getState}) => {
    const state = getState();
    const allLevels = selectLevelListForCube(state);
    const dimensionList = selectGroupDimensionList(state);
    const nextLevel = shuffle(allLevels).find(
      lvl => !dimensionList.includes(lvl.dimension)
    );
    if (nextLevel) {
      const group = structGroup(nextLevel);
      dispatch(doGroupUpdate(group));
    }
  },

  [CORE_RUNQUERY]: ({action, dispatch}) => {
    const {loadFailure, loadRequest, loadSuccess} = loadHandlers(dispatch, action);
    loadRequest(1);

    return Promise.resolve()
      .then(() => dispatch(doRunQueryOLAP()))
      .then(() => dispatch(doUpdatePermalink()))
      .then(loadSuccess, loadFailure);
  },

  /**
   * Handles the changes of a measure from the same table but different cube
   * @param {import("../types").MiddlewareActionParams<string>} param0
   */
  [CORE_UPDATE_DATASET]: ({action, dispatch, getState}) => {
    const cubeUri = action.payload;
    const state = getState();

    const currentMeasure = selectMeasure(state);
    const measures = selectMeasureListForTable(state);
    const measure = measures.find(ms => ms.cube === cubeUri);

    if (measure && measure.uri !== currentMeasure.uri) {
      dispatch(doMeasureUpdate(measure.uri));
      dispatch(doValidateParams());
      dispatch(doRunQueryCore());
    }
  },

  /**
   * This action must be used when there's a change in the UI measure selector.
   * It checks the new measure belongs to the same table as the previous one,
   * or uses the defaultTable function to pick it.
   * Then revalidate the other params.
   *
   * @param {import("../types").MiddlewareActionParams<{measure: MeasureItem, defaultTable?: ((cubes: CubeItem[]) => CubeItem)}>} param0
   */
  [CORE_UPDATE_MEASURE]: ({action, dispatch, getState}) => {
    // eslint-disable-next-line prefer-const
    let {measure, defaultTable} = action.payload;
    const state = getState();

    if (measure.tableId) {
      const currentCube = selectCube(state);
      if (currentCube && currentCube.tableId) {
        // TODO: Ensure the new measure belongs to the same table as the previous one
        // if (!measure.tableId.startsWith(currentCube.tableId))
        // const tableMeasures = measureTables[measure.tableId];
      }
      else if (defaultTable) {
        const cubes = selectCubeList(state);
        const measureTables = selectMeasureMapByTable(state);
        measure = userTableIdMeasure(measure, measureTables, cubes, defaultTable);
      }
    }

    dispatch(doMeasureUpdate(measure.uri));
    dispatch(doValidateParams());
  },

  /**
   * Handles the update of the url search params in the browser interface.
   *
   * @param {import("../types").MiddlewareActionParams<undefined>} param0
   */
  [CORE_UPDATE_PERMALINK]: ({getState}) => {
    const state = getState();

    if (typeof window === "object" && selectInstanceParams(state).permalink) {
      const queryState = selectQueryState(state);
      const permalink = selectPermalink(state);

      if (window.location.search.slice(1) !== permalink) {
        console.groupCollapsed("Permalink changed");
        console.log("activeChart", queryState.activeChart);
        console.log("filters", queryState.filters);
        console.log("groups", queryState.groups);
        console.log("measure", queryState.measure);
        console.log("showConfInt", queryState.showConfInt);
        console.log("timePeriod", queryState.timePeriod);
        console.groupEnd();
        const nextLocation = `${window.location.pathname}?${permalink}`;
        window.history.pushState(queryState, "", nextLocation);
      }
    }

    return Promise.resolve();
  }
};
