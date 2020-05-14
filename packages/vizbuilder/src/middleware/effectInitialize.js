import keyBy from "lodash/keyBy";
import {ensureArray, levelIteratorFactory} from "../helpers/arrays";
import {userTableIdMeasure} from "../helpers/find";
import {permalinkToState} from "../helpers/permalink";
import {sortNumericsOrStrings} from "../helpers/sort";
import {structFilter, structGroup} from "../helpers/structs";
import {fullNameToLevelLike} from "../helpers/transform";
import {
  selectCubeList,
  selectCubeMap,
  selectMeasureList,
  selectMeasureMap,
  selectMeasureMapByTable
} from "../store/cubes/selectors";
import {doInstanceUpdate} from "../store/instance/actions";
import {selectInstanceParams} from "../store/instance/selectors";
import {loadHandlers} from "../store/loading/actions";
import {doMeasureUpdate, doQueryInyect, doQueryReset} from "../store/query/actions";
import {selectPermalinkKeywordsProp, selectQueryState} from "../store/query/selectors";
import {
  CORE_INITIALIZE,
  CORE_INITIALIZE_MEASURE,
  doClientSetup,
  doFetchCubes,
  doRunQueryOLAP,
  doSetupMeasure,
  doUpdatePermalink,
  doValidateParams
} from "./actions";

export default {

  /**
   * Handles all the initialization procedure.
   *
   * @param {import("../types").MiddlewareActionParams<import("..").VizbuilderProps>} param0
   */
  [CORE_INITIALIZE]({action, dispatch, getState}) {
    const {loadFailure, loadRequest, loadSuccess} = loadHandlers(dispatch, action);
    loadRequest(1);

    const {
      datacap,
      defaultGroup,
      defaultMeasure,
      defaultTable,
      instanceKey,
      locale,
      multipliers,
      permalink,
      permalinkKeywords = {},
      src,
      topojson,
      visualizations
    } = action.payload;

    const state = getState();
    const {key: currentInstanceKey} = selectInstanceParams(state);

    if (instanceKey !== currentInstanceKey) {
      dispatch(doQueryReset());
    }

    dispatch(
      doInstanceUpdate({
        datacap: datacap ? Number.parseInt(`${datacap}`, 10) : undefined,
        defaultGroup: ensureArray(defaultGroup).map(fullNameToLevelLike),
        defaultMeasure,
        key: instanceKey,
        locale,
        multipliers,
        permalink,
        permalinkEnlarged: permalinkKeywords.enlarged,
        permalinkFilters: permalinkKeywords.filters,
        permalinkGroups: permalinkKeywords.groups,
        permalinkMeasure: permalinkKeywords.measure,
        permalinkConfint: permalinkKeywords.confint,
        permalinkPeriod: permalinkKeywords.period,
        topojson: Object.keys(topojson || {}),
        visualizations
      })
    );

    return Promise.resolve()
      .then(() => dispatch(doClientSetup(src)))
      .then(() => dispatch(doFetchCubes()))
      .then(() => dispatch(doSetupMeasure(defaultTable)))
      .then(() => dispatch(doRunQueryOLAP()))
      .then(() => dispatch(doUpdatePermalink()))
      .then(loadSuccess, loadFailure);
  },

  /**
   * There are two possible situations here:
   *
   * - It's the first load from a permalink.
   *   Groups and filters in queryState must be validated to check if they make
   *   sense together. If they don't, update them to default.
   *
   * - It's the first load without a permalink.
   *   There's no parameters, so everything must be filled from defaults.
   *
   * Then hydrate the remaining elements.
   * This action will attempt to choose the right measure.
   *
   * @param {import("../types").MiddlewareActionParams<{defaultTable: ((cubes: CubeItem[]) => CubeItem) | undefined}>} param0
   */
  [CORE_INITIALIZE_MEASURE]: ({action, dispatch, getState}) => {
    const {defaultTable} = action.payload;
    const state = getState();
    const measureList = selectMeasureList(state);
    const instanceParams = selectInstanceParams(state);

    let measure;

    if (
      instanceParams.permalink &&
      typeof window === "object" &&
      window.location.search.length > 1
    ) {
      // Permalink route
      const permalinkKeywords = selectPermalinkKeywordsProp(state);
      const permalinkQuery = permalinkToState(permalinkKeywords, location.search);

      const measureHash = permalinkQuery.measure;
      measure = measureList.find(m => m.hash === measureHash);

      if (measure) {
        const cubeMap = selectCubeMap(state);
        const cube = cubeMap[measure.cube];

        const levelMap = {};
        const iterator = levelIteratorFactory(cube.dimensions);
        for (let step = iterator.next(); !step.done; step = iterator.next()) {
          const level = step.value;
          levelMap[level.hash] = level;
        }

        const groups = permalinkQuery.groups.map(item => {
          const [hash, combine, ...rawMembers] = item.split("|");
          const members = sortNumericsOrStrings(rawMembers);
          // eslint-disable-next-line eqeqeq
          return structGroup({...levelMap[hash], combine: combine == "1", members});
        });

        const filters = permalinkQuery.filters.map(item => {
          const [measure, operator, value] = item.split("|");
          return structFilter({measure, operator, value: parseFloat(value)});
        });

        dispatch(
          doQueryInyect({
            activeChart: permalinkQuery.activeChart || null,
            measure: measure.uri,
            showConfInt: permalinkQuery.showConfInt,
            timePeriod: permalinkQuery.timePeriod,
            groups: keyBy(groups, i => i.key),
            filters: keyBy(filters, i => i.key)
          })
        );
        dispatch(doValidateParams());
      }
    }

    if (!measure) {
      const queryState = selectQueryState(state);
      // Defaults route
      const defaultMeasure = queryState.measure || instanceParams.defaultMeasure;

      if (defaultMeasure) {
        const measureMap = selectMeasureMap(state);
        measure =
          measureMap[defaultMeasure] || measureList.find(m => m.name === defaultMeasure);
      }
      measure = measure || measureList[0];

      if (measure.tableId && defaultTable) {
        const cubes = selectCubeList(state);
        const measureTables = selectMeasureMapByTable(state);
        measure = userTableIdMeasure(measure, measureTables, cubes, defaultTable);
      }

      dispatch(doMeasureUpdate(measure.uri));
      dispatch(doValidateParams());
    }
  }
};
