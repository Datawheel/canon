import {doInstanceUpdate} from "../actions/common";
import {loadHandlers} from "../actions/load";
import {
  CORE_INITIALIZE,
  CORE_INITIALIZE_MEASURE,
  CORE_UPDATE_PERMALINK,
  CORE_UPDATE_DATASET,
  CORE_UPDATE_MEASURE,
  doInitializeMeasure,
  doUpdateMeasure,
  CORE_VALIDATE_MEASURE,
  CORE_VALIDATE_QUERY
} from "../actions/middleware";
import {doClientSetup, doFetchCubes} from "../actions/olap";
import {doMeasureUpdate, doQueryInyect} from "../actions/query";
import {levelIteratorFactory, mapByName, findLevel} from "../helpers/arrays";
import {userTableIdMeasure, findByName} from "../helpers/sorting";
import {structGroup} from "../helpers/structs";
import {
  selectLevelListByCube,
  selectMeasureListByCube,
  selectMeasureListByTable,
  selectMeasureMapByTable
} from "../selectors/listsDerived";
import {selectMeasureList} from "../selectors/listsRaw";
import {selectPermalink} from "../selectors/permalink";
import {selectCube, selectMeasure} from "../selectors/queryRaw";
import {
  selectCubesState,
  selectInstanceParams,
  selectQueryState
} from "../selectors/state";
import {replaceLevelsInGroupings} from "../helpers/query";

export default {
  /**
   * Handles the initialization procedure
   * @param {import(".").MiddlewareActionParams<import("..").VizbuilderProps>} param0
   */
  [CORE_INITIALIZE]({action, dispatch}) {
    const {loadFailure, loadRequest, loadSuccess} = loadHandlers(dispatch, action);
    loadRequest(1);

    const {
      src,
      topojson,
      permalink,
      defaultMeasure,
      defaultTable,
      instanceKey
    } = action.payload;

    dispatch(
      doInstanceUpdate({
        topojson,
        permalink,
        defaultMeasure,
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

    const measureTables = selectMeasureMapByTable(state);
    console.log(measureTables);
    if (measure.tableId && defaultTable) {
      const cubes = selectCubesState(state);
      measure = userTableIdMeasure(measure, measureTables, cubes, defaultTable);
    }

    dispatch(doMeasureUpdate(measure.name));
  },

  /**
   * Handles the update of the url search params in the browser interface.
   * @param {import(".").MiddlewareActionParams<undefined>} param0
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
  },

  /**
   * Handles the changes of a measure from the same table but different cube
   * @param {import(".").MiddlewareActionParams<string>} param0
   */
  [CORE_UPDATE_DATASET]: ({action, dispatch, getState}) => {
    const state = getState();
    const cubeName = action.payload;
    const measures = selectMeasureListByTable(state);
    const measure = measures.find(ms => ms.cube === cubeName);
    if (measure) {
      dispatch(doUpdateMeasure({measure}));
    }
  },

  /**
   * This action is used when there's a measure change from the UI selector.
   * The measure was defined by the user, all other current parameters must
   * be revalidated against the new parent cube.
   *
   * @param {import(".").MiddlewareActionParams<{measure: MeasureItem, defaultTable?: ((cubes: CubeItem[]) => CubeItem)}>} param0
   */
  [CORE_UPDATE_MEASURE]: ({action, dispatch, getState}) => {
    let {measure, defaultTable} = action.payload;
    const state = getState();
    const queryState = state.vizbuilder.query;

    if (measure.tableId && defaultTable) {
      const currentMeasure = selectMeasure(state);
      const cubes = selectCubesState(state);
      const measureTables = selectMeasureMapByTable(state);
      if (currentMeasure.tableId) {
        const currentCube = selectCube(state);
        const tableMeasures = measureTables[measure.tableId];
      }
      measure = userTableIdMeasure(measure, measureTables, cubes, defaultTable);
    }

    /**
     * This line will update the redux state, so thereafter the state saved in
     * the `state` variable will be different to the current redux state.
     */
    dispatch(doMeasureUpdate(measure.key));

    const nextState = getState();

    const cube = selectCube(nextState);

    if (measure.cube !== cube.uri) {
      const dimensionsByName = mapByName(cube.dimensions);

      const groups = queryState.groups.slice();
      let g = groups.length;
      while (g--) {
        const group = groups[g];
        if (group.dimension in dimensionsByName) {
          const dimension = dimensionsByName[group.dimension];
          const hierarchy =
            findByName(group.level, dimension.hierarchies) ||
            findByName(group.hierarchy, dimension.hierarchies);
          if (hierarchy) {
            const level = findByName(group.level, hierarchy.levels);
            if (level) {
              groups[g] = {
                dimension: dimension.name,
                hierarchy: hierarchy.name,
                key: group.key,
                level: level.name,
                members: group.members
              };
              continue;
            }
          }
        }
        groups.splice(g, 1);
      }
    }

    // if (newQuery.cube === query.cube) {
    //   newQuery.groups = query.groups;
    //   newQuery.filters = query.filters;
    //   newUiParams.activeChart = uiParams.activeChart;
    //   newQuery.geoLevel = getGeoLevel(newQuery);
    //   return newState;
    // }
    // else {
    //   return replaceLevelsInGroupings(query, newQuery).then(newGroups => {

    //     newQuery.geoLevel = getGeoLevel(newQuery);
    //     return newState;
    //   });
    // }

    // dispatch(doRunQuery());
  },

  /** @param {import(".").MiddlewareActionParams<any>} param0 */
  [CORE_VALIDATE_MEASURE]: ({action, dispatch, getState}) => {},

  /**
   * @param {import(".").MiddlewareActionParams<any>} param0
   */
  [CORE_VALIDATE_QUERY]: ({dispatch, getState}) => {
    const state = getState();
    const queryState = state.vizbuilder.query;

    const levels = selectLevelListByCube(state);
    const measures = selectMeasureListByCube(state);

    const partialQuery = {
      groups: queryState.groups.filter(group =>
        levels.some(
          level =>
            level.dimension === group.dimension &&
            level.hierarchy === group.hierarchy &&
            level.name === group.level
        )
      ),
      filters: queryState.filters.filter(({measure: measureName}) =>
        measures.some(measure => measure.name === measureName)
      )
    };

    if (partialQuery.groups.length === 0) {
      const {defaultGroup} = selectInstanceParams(state);

      const groups = [structGroup({})];
    }

    dispatch(doQueryInyect(partialQuery));
  }
};
