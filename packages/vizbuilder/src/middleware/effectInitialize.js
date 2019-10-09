import {ensureArray} from "../helpers/arrays";
import {userTableIdMeasure} from "../helpers/sorting";
import {fullNameToLevelLike} from "../helpers/transform";
import {selectMeasureMapByTable} from "../selectors/listsDerived";
import {selectMeasureList} from "../selectors/listsRaw";
import {selectCubesState, selectInstanceParams} from "../selectors/state";
import {doInstanceUpdate} from "../store/instance/actions";
import {loadHandlers} from "../store/loading/actions";
import {doMeasureUpdate} from "../store/query/actions";
import {
  CORE_INITIALIZE,
  CORE_INITIALIZE_MEASURE,
  CORE_UPDATE_PERMALINK,
  doClientSetup,
  doFetchCubes,
  doInitializeMeasure,
  doValidateParams
} from "./actions";

export default {
  /**
   * Handles all the initialization procedure.
   *
   * @param {import(".").MiddlewareActionParams<import(".").VizbuilderProps>} param0
   */
  [CORE_INITIALIZE]({action, dispatch}) {
    const {loadFailure, loadRequest, loadSuccess} = loadHandlers(dispatch, action);
    loadRequest(1);

    const {
      defaultGroup,
      defaultMeasure,
      defaultTable,
      instanceKey,
      permalink,
      src,
      topojson,
      visualizations,
      multipliers,
      permalinkKeywords = {},
      datacap
    } = action.payload;

    dispatch(
      doInstanceUpdate({
        topojson: Object.keys(topojson || {}),
        permalink: Boolean(permalink),
        permalinkEnlarged: permalinkKeywords.enlarged,
        permalinkFilters: permalinkKeywords.filters,
        permalinkGroups: permalinkKeywords.groups,
        permalinkMeasure: permalinkKeywords.measure,
        defaultMeasure,
        defaultGroup: ensureArray(defaultGroup).map(fullNameToLevelLike),
        multipliers,
        datacap: Number.parseInt(`${datacap}`) || 20000,
        visualizations: ensureArray(visualizations),
        key: instanceKey
      })
    );

    if (!permalink) {
      delete this[CORE_UPDATE_PERMALINK];
    }

    return Promise.resolve()
      .then(() => dispatch(doClientSetup(src)))
      .then(() => dispatch(doFetchCubes()))
      .then(() => dispatch(doInitializeMeasure(defaultTable)))
      .then(loadSuccess, loadFailure);
  },

  /**
   * There are two possible situations here:
   *
   * - It's the first load without a permalink.
   *   There's no parameters, so everything must be filled from defaults.
   *
   * - It's the first load from a permalink.
   *   Groups and filters in queryState must be validated to check if they make
   *   sense together. If they don't, update them to default.
   *
   * Then hydrate the remaining elements.
   * This action will attempt to choose the right measure.
   *
   * @param {import(".").MiddlewareActionParams<{defaultTable: ((cubes: CubeItem[]) => CubeItem) | undefined}>} param0
   */
  [CORE_INITIALIZE_MEASURE]: ({action, dispatch, getState}) => {
    const {defaultTable} = action.payload;
    const state = getState();
    const queryState = state.vizbuilder.query;

    const instanceParams = selectInstanceParams(state);
    const measureList = selectMeasureList(state);
    const defaultMeasure = queryState.measure || instanceParams.defaultMeasure;

    let measure;
    if (defaultMeasure) {
      measure = measureList.find(m => m.name === defaultMeasure);
    }
    measure = measure || measureList[0];

    if (measure.tableId && defaultTable) {
      const cubes = selectCubesState(state);
      const measureTables = selectMeasureMapByTable(state);
      measure = userTableIdMeasure(measure, measureTables, cubes, defaultTable);
    }

    dispatch(doMeasureUpdate(measure.uri));
    dispatch(doValidateParams());
  }
};
