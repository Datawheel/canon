/* eslint-disable prefer-arrow-callback */
import localforage from "localforage";
import {getHashCode, parseQueryToAdd, getLevelDimension} from "../helpers/transformations";
import {STORAGE_CART_KEY, TYPE_OLAP} from "../helpers/consts";
import {MultiClient} from "@datawheel/olap-client";
import {nest as d3Nest} from "d3-collection";

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
  if (initial.urls) {
    initial.list = {};
    initial.urls.map(url => {
      const parsed = parseQueryToAdd(url);
      initial.list[parsed.id] = parsed;
    });
  }

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
  const parsed = parseQueryToAdd(query);
  return {
    type: ADD_TO_CART,
    payload: parsed
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
export const loadDatasetsAction = (datasets, sharedDimensionLevelSelected, dateDimensionLevelSelected) => async dispatch => {

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

      multiClient.getCube(datasetObj.cube, cubes => cubes.find(c => datasetObj.provider.server.indexOf(c.server) > -1)).then(cube => {

        // Store dimensions
        dimensions[cube.name] = cube.dimensionsByName;
        queries[cube.name] = cube.query;

        // Add new cube loaded
        loaded += 1;

        // All metadata is loaded and correct
        if (loaded === datasetIds.length) {

          if (!sharedDimensionLevelSelected && !dateDimensionLevelSelected) {

            // Calculate common dimensions
            let sharedDimensionsList = getSharedDimensions(dimensions);
            const dateDimensionsList = getDateDimensions(sharedDimensionsList);
            sharedDimensionsList = sharedDimensionsList.filter(sd => !dateDimensionsList.find(dd => dd.name === sd.name));

            // Set results in redux to fill controls
            dispatch(setSharedDimensionListAction(sharedDimensionsList));
            // let sharedDimensionLevelSelected;
            if (sharedDimensionsList[0]) {
              sharedDimensionLevelSelected = getLevelDimension(sharedDimensionsList[0].hierarchies[0].levels[0]);
              dispatch(sharedDimensionLevelChangedAction(sharedDimensionLevelSelected));
            }
            dispatch(setDateDimensionListAction(dateDimensionsList));
            // let dateDimensionLevelSelected;
            if (dateDimensionsList[0]) {
              dateDimensionLevelSelected = getLevelDimension(dateDimensionsList[0].hierarchies[0].levels[0]);
              dispatch(dateDimensionLevelChangedAction(dateDimensionLevelSelected));
            }

          }

          // Process All datasets
          queryAndProcessDatasets(dispatch, datasets, multiClient, queries, sharedDimensionLevelSelected, dateDimensionLevelSelected);
        }

      }).catch(e => {
        console.error(e);
      });
    }
  });
};

/** Generate queries & process results */
const queryAndProcessDatasets = (dispatch, datasets, multiClient, queries, sharedDimensionsLevel, dateDimensionsLevel) => {
  dispatch(startProcessingAction());

  let loaded = 0;

  const loadedData = {};

  const datasetIds = Object.keys(datasets);

  datasetIds.map(datasetId => {
    const datasetObj = datasets[datasetId];

    if (datasetObj.provider.type === TYPE_OLAP) {
      const query = queries[datasetObj.cube];

      if (sharedDimensionsLevel) {
        query.addDrilldown(sharedDimensionsLevel);
      }

      if (dateDimensionsLevel) {
        query.addDrilldown(dateDimensionsLevel);
      }

      if (datasetObj.query.params.drilldown) {
        datasetObj.query.params.drilldown.map(drill => {
          if (!sharedDimensionsLevel || sharedDimensionsLevel.dimension !== drill.dimension) {
            query.addDrilldown(drill);
          }
        });
      }

      if (datasetObj.query.params.measures) {
        datasetObj.query.params.measures.map(m => {
          query.addMeasure(m);
        });
      }

      multiClient.execQuery(query)
        .then(aggregation => {

          dispatch(successLoadDatasetAction(datasetId));
          loaded += 1;
          loadedData[datasetId] = aggregation.data;

          // All metadata is loaded and correct
          if (loaded === datasetIds.length) {

            joinResultsAndSave(dispatch, loadedData, sharedDimensionsLevel, dateDimensionsLevel);

          }

        });

    }
  });

};

/** Merge datasets and show table */
const joinResultsAndSave = (dispatch, responses, sharedDimensionsLevel, dateDimensionsLevel) => {

  // TODO: merge datasets
  console.log("RESPONSES !!!", responses);
  console.log("sharedDimensionsLevel !!!", sharedDimensionsLevel);
  console.log("dateDimensionsLevel !!!", dateDimensionsLevel);

  // Think about dates
  let dates = [];
  let entities = [];
  const nestedResponses = Object.keys(responses).map(key => {
    const queryResponses = responses[key];

    let nested = d3Nest();

    if (sharedDimensionsLevel) {
      entities = entities.concat([...new Set(queryResponses.map(x => x[sharedDimensionsLevel.level]))]);
      nested = nested
        .key(function(d) {
          return d[sharedDimensionsLevel.level];
        });
    }
    if (dateDimensionsLevel) {
      dates = dates.concat([...new Set(queryResponses.map(x => x[dateDimensionsLevel.level]))]);
      nested = nested
        .key(function(d) {
          return d[dateDimensionsLevel.level];
        });
    }

    return nested.map(queryResponses);
  });
  entities = [...new Set(entities)].sort();
  dates = [...new Set(dates)].sort();

  console.log(dates);
  console.log(entities);
  console.log(nestedResponses);

  let cols = [];
  const data = [];

  // Merge years in rows
  entities.map(entity => {
    dates.map(date => {
      let record = {};
      let item;
      nestedResponses.map(nestedResponse => {
        item = nestedResponse.get(entity);
        if (item) {
          item = item.get(date);
          if (item) {
            record = {...record, ...item[0]};
            cols = cols.length > Object.keys(record).length ? cols : Object.keys(record);
          }
        }
      });
      data.push(record);
    });
  });

  // If show ID cols
  cols = cols
    .filter(field => !(field.startsWith("ID ") || field.endsWith(" ID")));

  cols = cols.map(field => ({
    Header: field,
    accessor: field
  }));

  console.log(cols);
  console.log(data);

  // TODO Merge years in cols


  setTimeout(() => {
    dispatch(endProcessingAction(cols, data));
  }, 2000);
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
export const endProcessingAction = (cols, data) => ({
  type: END_PROCESSING_DATASETS,
  payload: {cols, data}
});

/** Shared Dimensions */
export const SET_SHARED_DIMENSION_LIST = "@@canon-cart/SET_SHARED_DIMENSION_LIST";
export const setSharedDimensionListAction = list => ({
  type: SET_SHARED_DIMENSION_LIST,
  payload: {dimensions: list}
});

export const SHARED_DIMENSION_CHANGED = "@@canon-cart/SHARED_DIMENSION_CHANGED";
export const sharedDimensionLevelChangedAction = dimId => ({
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
export const dateDimensionLevelChangedAction = dimId => ({
  type: DATE_DIMENSION_CHANGED,
  payload: {id: dimId}
});




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
