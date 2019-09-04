/* eslint-disable prefer-arrow-callback */
import localforage from "localforage";
import {getHashCode, parseURL} from "../helpers/transformations";
import {STORAGE_CART_KEY, TYPE_OLAP} from "../helpers/consts";
import {MultiClient} from "@datawheel/olap-client";
import {nest} from "d3-collection";

/* Init Cart */
export const INIT_CART = "@@canon-cart/INIT_CART";
export const initCartAction = () => dispatch => {
  localforage.getItem(STORAGE_CART_KEY).then(data => {
    dispatch(sendInitCartAction(data));
    return data;
  }).catch(err => {
    console.warn(err);
    dispatch(sendInitCartAction(false));
  });
};
export const sendInitCartAction = initial => {
  initial = initial ? initial : {};
  return {
    type: INIT_CART,
    payload: initial
  };
};

/* Clear Cart */
export const CLEAR_CART = "@@canon-cart/CLEAR_CART";
export const clearCartAction = () => ({
  type: CLEAR_CART
});

/* Add query to Cart */
export const ADD_TO_CART = "@@canon-cart/ADD_TO_CART";
export const addToCartAction = query => {
  const parsed = parseURL(query);
  return {
    type: ADD_TO_CART,
    payload: {
      id: getHashCode(query),
      url: parsed.query,
      name: parsed.title,
      query: parsed.meta,
      provider: parsed.provider,
      cube: parsed.cube,
      isLoaded: false
    }
  };
};

/* Remove query from Cart */
export const REMOVE_FROM_CART = "@@canon-cart/REMOVE_FROM_CART";
export const removeFromCartAction = query => {
  const id = getHashCode(query);
  return {
    type: REMOVE_FROM_CART,
    payload: {id}
  };
};

/* Toggle cart setting */
export const TOGGLE_CART_SETTING = "@@canon-cart/TOGGLE_CART_SETTING";
export const toggleSettingAction = id => ({
  type: TOGGLE_CART_SETTING,
  payload: {id}
});

/** Loading datasets */
export const loadDatasetsAction = datasets => async dispatch => {

  // Start load screen
  dispatch(loadAllDatasetsAction());

  // Variables
  let loaded = 0;
  const dimensions = {}, queries = {};

  // Datasets Ids
  const datasetIds = Object.keys(datasets);

  // Initialize Multiclient
  const serverList = datasetIds.map(datasetId => datasets[datasetId].provider.server);
  const multiClient = await MultiClient.fromURL(...serverList);

  // Iterate & Query
  datasetIds.map(datasetId => {
    const datasetObj = datasets[datasetId];

    if (datasetObj.provider.type === TYPE_OLAP) {
      console.log(datasetObj);
      multiClient.getCube(datasetObj.cube, cubes => cubes.find(c => datasetObj.provider.server.indexOf(c.server) > -1)).then(cube => {

        // Store dimensions
        dimensions[cube.name] = cube.dimensionsByName;
        queries[cube.name] = cube.query;

        // Add new cube loaded
        loaded += 1;

        // All metadata is loaded and correct
        if (loaded === datasetIds.length) {

          // Calculate common dimensions
          let sharedDimensionsList = getSharedDimensions(dimensions);
          const dateDimensionsList = getDateDimensions(sharedDimensionsList);
          sharedDimensionsList = sharedDimensionsList.filter(sd => !dateDimensionsList.find(dd => dd.name === sd.name));

          // Set results in redux to fill controls
          dispatch(setSharedDimensionListAction(sharedDimensionsList));
          if (sharedDimensionsList[0]) {
            dispatch(sharedDimensionChangedAction(sharedDimensionsList[0].name));
          }
          dispatch(setDateDimensionListAction(dateDimensionsList));
          if (dateDimensionsList[0]) {
            dispatch(dateDimensionChangedAction(dateDimensionsList[0].name));
          }

          // Process All datasets
          processAllDatasets(dispatch, datasets, multiClient, queries, sharedDimensionsList, dateDimensionsList);
        }

      }).catch(e => {
        console.error(e);
      });
    }
  });

};

export const LOAD_DATASETS = "@@canon-cart/LOAD_DATASETS";
export const loadAllDatasetsAction = () => ({
  type: LOAD_DATASETS
});

export const SUCCESS_LOAD_DATASET = "@@canon-cart/SUCCESS_LOAD_DATASET";
export const successLoadDatasetAction = id => ({
  type: SUCCESS_LOAD_DATASET,
  payload: {id}
});

export const FAILURE_LOAD_DATASET = "@@canon-cart/FAILURE_LOAD_DATASET";
export const failureLoadDatasetAction = id => ({
  type: FAILURE_LOAD_DATASET,
  payload: {id}
});

/** Processing datasets events */
export const START_PROCESSING_DATASETS = "@@canon-cart/START_PROCESSING_DATASETS";
export const startProcessingAction = () => ({
  type: START_PROCESSING_DATASETS
});

export const END_PROCESSING_DATASETS = "@@canon-cart/END_PROCESSING_DATASETS";
export const endProcessingAction = () => ({
  type: END_PROCESSING_DATASETS
});

/** Shared Dimensions */
export const SET_SHARED_DIMENSION_LIST = "@@canon-cart/SET_SHARED_DIMENSION_LIST";
export const setSharedDimensionListAction = list => ({
  type: SET_SHARED_DIMENSION_LIST,
  payload: {dimensions: list}
});

export const SHARED_DIMENSION_CHANGED = "@@canon-cart/SHARED_DIMENSION_CHANGED";
export const sharedDimensionChangedAction = dimId => ({
  type: SHARED_DIMENSION_CHANGED,
  payload: {id: dimId}
});

/** Date Dimensions */
export const SET_DATE_DIMENSION_LIST = "@@canon-cart/SET_DATE_DIMENSION_LIST";
export const setDateDimensionListAction = list => ({
  type: SET_DATE_DIMENSION_LIST,
  payload: {dimensions: list}
});

export const DATE_DIMENSION_CHANGED = "@@canon-cart/DATE_DIMENSION_CHANGED";
export const dateDimensionChangedAction = dimId => ({
  type: DATE_DIMENSION_CHANGED,
  payload: {id: dimId}
});


/** processAllDatasets */
export const processAllDatasets = (dispatch, datasets, multiClient, queries, sharedDimensionsList, dateDimensionsList) => {
  dispatch(startProcessingAction());

  let loaded = 0;

  const loadedData = {};

  const datasetIds = Object.keys(datasets);

  datasetIds.map(datasetId => {
    const datasetObj = datasets[datasetId];

    if (datasetObj.provider.type === TYPE_OLAP) {
      const query = queries[datasetObj.cube];

      console.log(datasetObj.cube, query, sharedDimensionsList, dateDimensionsList);

      console.log(datasetObj.query.params.drilldown);

      if (datasetObj.query.params.drilldown) {
        datasetObj.query.params.drilldown.map(m => {
          query.addDrilldown(m);
        });
      }

      if (datasetObj.query.params.measures) {
        datasetObj.query.params.measures.map(m => {
          query.addMeasure(m);
        });
      }

      if (dateDimensionsList) {
        dateDimensionsList.map(d => {
          const level = d.hierarchies[0].levels[0];
          query.addDrilldown({level: level.name, dimension: level.dimension.fullName});
        });
      }

      if (sharedDimensionsList) {
        sharedDimensionsList.map(d => {
          const level = d.hierarchies[0].levels[0];
          query.addDrilldown({level: level.name, dimension: level.dimension.fullName});
        });
      }

      multiClient.execQuery(query)
        .then(aggregation => {

          dispatch(successLoadDatasetAction(datasetId));
          loaded += 1;
          loadedData[datasetId] = aggregation.data;

          // All metadata is loaded and correct
          if (loaded === datasetIds.length) {
            console.log("RESPONSES !!!", loadedData);
            // TODO: merge datasets

            setTimeout(() => {
              dispatch(endProcessingAction());
            }, 2000);
          }

        });

    }
  });

  /* datasetIds.map(datasetId => {
    const datasetObj = datasets[datasetId];
    if (datasetObj.provider.type === TYPE_OLAP) {
      client.addServer(datasetObj.provider.server).then(status => {

        client.cubes().then(cubes => {
          const cube = cubes.find(c => c.name === datasetObj.cube);
          const query = cube.query;

          if (datasetObj.query.params.drilldown) {
            datasetObj.query.params.drilldown.map(m => {
              query.addDrilldown(m);
            });
          }

          if (datasetObj.query.params.measures) {
            datasetObj.query.params.measures.map(m => {
              query.addMeasure(m);
            });
          }

          if (dateDimensionsList) {
            dateDimensionsList.map(d => {
              const level = d.hierarchies[0].levels.find(lev => lev.name.toLowerCase().indexOf("all") === -1);
              query.addDrilldown(level.fullname);
            });
          }

          if (sharedDimensionsList) {
            sharedDimensionsList.map(d => {
              const level = d.hierarchies[0].levels.find(lev => lev.name.toLowerCase().indexOf("all") === -1);
              query.addDrilldown(level.fullname);
            });
          }

          return client.execQuery(query);
        }).then(aggregation => {
          dispatch(successLoadDatasetAction(datasetId));
          loaded += 1;
          loadedData[datasetId] = aggregation.data;

          // All metadata is loaded and correct
          if (loaded === datasetIds.length) {
            console.log("RESPONSES !!!", loadedData);
            // TODO: merge datasets

            setTimeout(() => {
              dispatch(endProcessingAction());
            }, 2000);
          }

        });

      });

      // Add server to client

    }
  }); */

};


/** Processing datasets helpers fns  */
const getSharedDimensions = cubeDimensionMap => {
  let sharedDimNames = [];
  let sharedDimObjects = [];
  Object.keys(cubeDimensionMap).map(cube => {
    const dimensionsNames = Object.keys(cubeDimensionMap[cube]);
    sharedDimNames = sharedDimNames.length === 0 ? dimensionsNames : dimensionsNames.filter(value => sharedDimNames.includes(value));
    sharedDimObjects = sharedDimNames.map(dimId => cubeDimensionMap[cube][dimId]);
  });
  return sharedDimObjects;
};

const getDateDimensions = sharedDimensions => {
  const dateDimensions = [];
  sharedDimensions.map(sd => {
    if (sd.name.toLowerCase() === "date" || sd.name.toLowerCase() === "year") {
      dateDimensions.push(sd);
    }
  });
  return dateDimensions;
};
