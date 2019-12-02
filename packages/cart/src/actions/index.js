/* eslint-disable prefer-arrow-callback */
import localforage from "localforage";
import {getHashCode, parseQueryToAdd, getProviderInfo, getLevelDimension, parseLevelDimension, parseQueryParams} from "../helpers/transformations";
import {STORAGE_CART_KEY, TYPE_OLAP, TYPE_LOGICLAYER} from "../helpers/consts";
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
export const addToCartDecideAction = query => async dispatch => {

  const providerObj = getProviderInfo(query);

  if (providerObj.type === TYPE_LOGICLAYER) {
    const providerObj = getProviderInfo(query);
    const meta = parseQueryParams(query);
    const cubeName = meta.params.cube;
    const tesseractCubeUrl = `${providerObj.server}/cubes/${cubeName}/aggregate.jsonrecords?`;
    const client = await MultiClient.fromURL(providerObj.server);
    const queryParams = [];
    client.getCube(cubeName, cubes => cubes.find(c => providerObj.server.indexOf(c.server) > -1))
      .then(cube => {
        // Measures
        meta.params.measures.map(measure => {
          queryParams.push(`measures[]=${measure}`);
        });

        console.log("ACTION", meta.params);

        // Drilldowns
        meta.params.drilldowns.map(drill => {
          cube.dimensions.map(dim => {
            for (const level of dim.levelIterator) {
              if (level.uniqueName === drill.dimension) {
                queryParams.push(`drilldowns[]=${level.fullName}`);
              }
            }
          });
        });

        // TODO Cuts

        dispatch(addToCartAction(tesseractCubeUrl + queryParams.join("&")));
      });
  }
  else {
    dispatch(addToCartAction(query));
  }

};
export const addToCartAction = query => {
  const parsed = parseQueryToAdd(query);
  console.log("addToCartAction", query);
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

export const SAVE_RESPONSES = "@@canon-cart/SAVE_RESPONSES";
export const saveResponsesAction = responses => ({
  type: SAVE_RESPONSES,
  payload: {responses}
});



/** Loading datasets */
export const loadDatasetsAction = (datasets, sharedDimensionLevelSelected, dateDimensionLevelSelected, settings) => async dispatch => {

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
            if (sharedDimensionsList[0]) {
              sharedDimensionLevelSelected = getLevelDimension(sharedDimensionsList[0].hierarchies[0].levels[0]);
              dispatch(sharedDimensionLevelChangedAction(sharedDimensionLevelSelected));
            }

            dispatch(setDateDimensionListAction(dateDimensionsList));
            if (dateDimensionsList[0]) {
              dateDimensionLevelSelected = getLevelDimension(dateDimensionsList[0].hierarchies[0].levels[0]);
              dispatch(dateDimensionLevelChangedAction(dateDimensionLevelSelected));
            }

          }

          // Process All datasets
          queryAndProcessDatasets(dispatch, datasets, multiClient, queries, sharedDimensionLevelSelected, dateDimensionLevelSelected, settings);
        }

      }).catch(e => {
        console.error(e);
      });
    }
  });
};

/** Generate queries & process results */
const queryAndProcessDatasets = (dispatch, datasets, multiClient, queries, sharedDimensionsLevel, dateDimensionsLevel, settings) => {

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

      if (datasetObj.query.params.drilldowns) {
        datasetObj.query.params.drilldowns.map(drill => {
          if ((!sharedDimensionsLevel || sharedDimensionsLevel.dimension !== drill.dimension) &&
            (!dateDimensionsLevel || dateDimensionsLevel.dimension !== drill.dimension)) {
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
          loadedData[datasetId] = aggregation;

          // All metadata is loaded and correct
          if (loaded === datasetIds.length) {
            dispatch(saveResponsesAction(loadedData));
            joinResultsAndShow(loadedData, sharedDimensionsLevel, dateDimensionsLevel, settings)(dispatch);
          }

        });

    }
  });

};

/** Merge datasets and show table */
export const joinResultsAndShow = (responses, sharedDimensionsLevel, dateDimensionsLevel, settings) => dispatch => {

  dispatch(startProcessingAction());

  // Drilldowns
  let dims = [];
  let bigList = [];
  let measuresList = [];
  if (sharedDimensionsLevel) {
    dims = [sharedDimensionsLevel];
  }
  Object.keys(responses).map(key => {
    const queryObject = responses[key].query;
    measuresList = measuresList.concat(queryObject.measures.map(me => me.name));
    bigList = bigList.concat(responses[key].data);
    let dim, drilldownLevel;
    queryObject.drilldowns.map(drill => {
      drilldownLevel = parseLevelDimension(drill.fullName);
      dim = dims.find(d => drilldownLevel.dimension === d.dimension);
      if (!dim) {
        if (!dateDimensionsLevel || dateDimensionsLevel.dimension !== drilldownLevel.dimension) {
          dims.push(drilldownLevel);
        }
      }
    });
  });

  // Nested by drilldown
  let nestedBigList = d3Nest();
  dims.map(dim => {
    nestedBigList = nestedBigList
      .key(d => d[dim.level]);
  });
  if (dateDimensionsLevel && !settings.pivotYear.value) {
    nestedBigList = nestedBigList
      .key(d => d[dateDimensionsLevel.level]);
  }
  nestedBigList = nestedBigList.map(bigList);

  // Get plain big list
  const plainBigList = getPlainBigList(nestedBigList, settings, dateDimensionsLevel.level, measuresList);

  let cols = plainBigList.cols;
  const data = plainBigList.rows;

  // If hide ID cols
  if (!settings.showID.value) {
    cols = cols
      .filter(field => !(field.toLowerCase().startsWith("id ") || field.toLowerCase().endsWith(" id")));
  }

  // If hide MOE cols
  if (!settings.showMOE.value) {
    cols = cols
      .filter(field => !(field.toLowerCase().startsWith("moe ") || field.toLowerCase().endsWith(" moe")));
  }

  // Create react-table ready cols config
  cols = cols.map(field => ({
    Header: field,
    accessor: field
  }));

  setTimeout(() => {
    dispatch(endProcessingAction(cols, data));
  }, 500); // 500ms of suspense...

};

/** Recursively process Big Map list  */
const getPlainBigList = (mapItem, settings, dateDimensionsLevel, measuresList) => {
  let rows = [];
  let cols = [];
  mapItem.each((value, key, map) => {
    if (value.length) { // It's an array of records! Last leaf!
      let record = {};
      if (settings.pivotYear.value) {
        record = getPivotedRecord(value, dateDimensionsLevel, measuresList);
      }
      else {
        record = getNonPivotedRecord(value);
      }
      rows.push(record);
      cols = cols.concat(Object.keys(record));
    }
    else { // It's a map, in the branch yet run recursion
      const tempResults = getPlainBigList(value, settings, dateDimensionsLevel, measuresList);
      rows = rows.concat(tempResults.rows);
      cols = cols.concat(tempResults.cols);
    }
  });

  cols = [...new Set(cols)];

  return {rows, cols};
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

const getPivotedRecord = (records, dateLevel, measuresList) => {
  let finalPivotedRecord;
  records.map(record => {
    const pivoted = {...record};
    measuresList.map(measure => {
      if (typeof pivoted[measure] !== "undefined") {
        pivoted[`${measure}(${pivoted[dateLevel]})`] = pivoted[measure];
        delete pivoted[measure];
      }
    });
    if (dateLevel) {
      delete pivoted[dateLevel];
    }
    if (typeof pivoted[`${dateLevel} ID`] !== "undefined") {
      delete pivoted[`${dateLevel} ID`];
    }
    if (typeof pivoted[`ID ${dateLevel}`] !== "undefined") {
      delete pivoted[`ID ${dateLevel}`];
    }

    finalPivotedRecord = {...finalPivotedRecord, ...pivoted};
  });
  return finalPivotedRecord;
};

const getNonPivotedRecord = recordList => recordList.reduce((nonPivoted, item) => ({...nonPivoted, ...item}), {});
