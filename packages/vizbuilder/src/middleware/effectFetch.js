import {DimensionType, MultiClient} from "@datawheel/olap-client";
import yn from "yn";
import {
  OLAP_FETCHCUBES,
  OLAP_FETCHMEMBERS,
  OLAP_RUNQUERY,
  OLAP_SETUP
} from "./actions";
import {ensureArray} from "../helpers/arrays";
import generateCharts from "../helpers/charts";
import {applyQueryParams} from "../helpers/query";
import {structCubeBuilder} from "../helpers/structs";
import {selectGeomapLevels, selectIsGeomapMode} from "../selectors/props";
import {selectCube, selectMeasure} from "../selectors/queryRaw";
import {selectQueryState} from "../selectors/state";
import {doChartsUpdate} from "../store/charts/actions";
import {doCubesUpdate} from "../store/cubes/actions";

export default {
  /** @param {MiddlewareActionParams<string | string[]>} param0 */
  [OLAP_SETUP]: ({action, client}) => {
    const urlList = ensureArray(action.payload);
    return MultiClient.dataSourcesFromURL(...urlList).then(dataSources => {
      // @ts-ignore
      client.datasources = [];
      client.addDataSource(...dataSources);
    });
  },

  /** @param {MiddlewareActionParams<undefined>} param0 */
  [OLAP_FETCHCUBES]: ({client, dispatch, getState}) => {
    const state = getState();
    const isGeomapMode = selectIsGeomapMode(state);
    const geomapLevels = selectGeomapLevels(state);

    /** @type {(cube: import("@datawheel/olap-client").Cube) => boolean} */
    const isGeomapCube = cube =>
      !yn(cube.annotations.hide_in_map) &&
      cube.dimensions.some(dim => {
        if (dim.dimensionType === DimensionType.Geographic) {
          for (let hierarchy, h = 0; (hierarchy = dim.hierarchies[h]); h++) {
            for (let level, l = 0; (level = hierarchy.levels[l]); l++) {
              if (geomapLevels.indexOf(level.name) > -1) {
                return true;
              }
            }
          }
        }
        return false;
      });

    return client.getCubes().then(cubes => {
      const cubeItems = cubes
        .filter(
          isGeomapMode
            ? cube => !yn(cube.annotations.hide_in_ui) || isGeomapCube(cube)
            : cube => !yn(cube.annotations.hide_in_ui)
        )
        .map(structCubeBuilder);
      dispatch(doCubesUpdate(cubeItems));
    });
  },

  /** @param {MiddlewareActionParams<LevelLike>} param0 */
  [OLAP_FETCHMEMBERS]: ({action, client, getState}) => {
    const state = getState();
    const measure = selectMeasure(state);

    if (!measure) {
      return Promise.reject(`${OLAP_FETCHMEMBERS}: Measure is not defined.`);
    }

    return client.getCube(measure.cube).then(cube => {
      const {dimension: dimName, hierarchy: hieName, name: lvlName} = action.payload;

      for (let level of cube.levelIterator) {
        if (
          level.name === lvlName &&
          level.hierarchy.name === hieName &&
          level.dimension.name === dimName
        ) {
          const query = cube.query
            .addMeasure(measure.name)
            .addDrilldown(level)
            .setOption("nonempty", true)
            .setOption("distinct", false)
            .setOption("parents", true)
            .setOption("debug", false)
            .setOption("sparse", true);
          return client.execQuery(query, "aggregate");
        }
      }

      throw new Error(
        `${OLAP_FETCHMEMBERS}: Level descriptor ${JSON.stringify(
          action.payload
        )} doesn't match with a level from cube ${cube.name}`
      );
    });
  },

  /**
   * @param {MiddlewareActionParams<undefined>} param0
   */
  [OLAP_RUNQUERY]: ({client, dispatch, getState}) => {
    const state = getState();
    const queryState = selectQueryState(state);
    const cube = selectCube(state);

    if (cube) {
      return client
        .getCube(cube.name)
        .then(cube => {
          const query = applyQueryParams(cube.query, queryState);
          return client.execQuery(query, "aggregate");
        })
        .then(aggregation => {
          const charts = generateCharts(aggregation);
          dispatch(doChartsUpdate(charts));
        });
    }

    return Promise.reject(`${OLAP_RUNQUERY}: cube is undefined`);
  }
};
