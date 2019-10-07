import {DimensionType, MultiClient} from "@datawheel/olap-client";
import yn from "yn";
import {doChartsUpdate, doCubesUpdate} from "../actions/common";
import {
  OLAP_FETCHCUBES,
  OLAP_FETCHMEMBERS,
  OLAP_RUNQUERY,
  OLAP_SETUP
} from "../actions/olap";
import {ensureArray, findLevel} from "../helpers/arrays";
import generateCharts from "../helpers/charts";
import {applyQueryParams} from "../helpers/query";
import {structCubeBuilder} from "../helpers/structs";
import {selectGeomapLevels, selectIsGeomapMode} from "../selectors/props";
import {selectCube, selectMeasure} from "../selectors/queryRaw";
import {selectQueryState} from "../selectors/state";

export default {
  [OLAP_SETUP]: ({action, client}) => {
    const urlList = ensureArray(action.payload);
    return MultiClient.dataSourcesFromURL(...urlList).then(dataSources => {
      client.addDataSource(...dataSources);
    });
  },

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

  /** @param {import(".").MiddlewareActionParams<LevelItem>} param0 */
  [OLAP_FETCHMEMBERS]: ({action, client, getState}) => {
    const state = getState();
    const measure = selectMeasure(state);

    if (measure) {
      const {dimension: dimName, hierarchy: hieName, name: lvlName} = action.payload;
      return client.getCube(measure.cube).then(cube => {
        const level = findLevel(
          cube.dimensions,
          (lvl, hie, dim) =>
            lvl.name === lvlName && hie.name === hieName && dim.name === dimName
        );

        if (!level) {
          throw new Error(
            `${OLAP_FETCHMEMBERS}: Level descriptor ${JSON.stringify(
              action.payload
            )} doesn't match with a level from cube ${cube.name}`
          );
        }

        const query = cube.query
          .addMeasure(measure.name)
          .addDrilldown(level)
          .setOption("nonempty", true)
          .setOption("distinct", false)
          .setOption("parents", true)
          .setOption("debug", false)
          .setOption("sparse", true);
        return client.execQuery(query, "aggregate");
      });
    }

    return Promise.reject(`${OLAP_FETCHMEMBERS}: Measure is not defined.`);
  },

  /**
   * @param {import(".").MiddlewareActionParams<undefined>} param0
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
