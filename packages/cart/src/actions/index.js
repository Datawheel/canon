import localforage from "localforage";
import {getHashCode, getQueryParsedToAdd, getProviderInfo, getLevelDimension, parseLevelDimension, getHeaderHTML} from "../helpers/transformations";
import {STORAGE_CART_KEY, TYPE_OLAP, TYPE_LOGICLAYER, TYPE_CANON_STATS} from "../helpers/consts";
import {MultiClient} from "@datawheel/olap-client";
import {nest as d3Nest} from "d3-collection";
import {FORMATTERS, isIDColName, isMOEColName} from "../helpers/formatters";

/* Init cart: Check if there is data saved in your local storage.
If not init an empty cart*/
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

/* Parse and prepare the urls from local storage, if exists.
Dispatch the init cart */
export const sendInitCartAction = initial => {
  initial = initial ? initial : {};
  if (initial.urls) {
    initial.list = {};
    initial.urls.map(urlObj => {
      const parsed = getQueryParsedToAdd(urlObj.url, urlObj.originalUrl);
      initial.list[parsed.id] = parsed;
    });
  }
  return {
    type: INIT_CART,
    payload: initial
  };
};

/* Clean all items in cart Cart no matter why */
export const CLEAR_CART = "@@canon-cart/CLEAR_CART";
export const clearCartAction = () => ({
  type: CLEAR_CART
});

/* Adding query to Cart (loading state for add to cart btn) */
export const ADDING_TO_CART = "@@canon-cart/ADDING_TO_CART";
export const addingToCartAction = query => ({
  type: ADDING_TO_CART,
  payload: query
});

/* Decide how to process different types of queries */
export const ADD_TO_CART = "@@canon-cart/ADD_TO_CART";
export const addToCartAction = query => async dispatch => {

  const providerObj = getProviderInfo(query);

  // Adding process start (disabled add to cart btn).
  // This loading state will finish when actuallyAddToCartAction finish.
  dispatch(addingToCartAction(query));

  // It is a logic layer URL
  if (providerObj.type === TYPE_LOGICLAYER) {

    // Get data from url
    const providerObj = getProviderInfo(query);

    // Convert url to Tesseract query
    const client = await MultiClient.fromURL(providerObj.server);
    const queryObj = await client.parseQueryURL(query);

    // Add new Query to cart
    dispatch(actuallyAddToCartAction(`${queryObj.toString("aggregate")}`, query));
  }
  // It is a Mondrian or Tesseract API URL
  else {
    // Add Query to cart
    dispatch(actuallyAddToCartAction(query));
  }

};

/* Parse and add query to cart */
export const actuallyAddToCartAction = (query, logicLayerUrl = false) => {
  const parsed = getQueryParsedToAdd(query, logicLayerUrl);
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

/* Toggle cut selection */
export const TOGGLE_CUT_SELECTION = "@@canon-cart/TOGGLE_CUT_SELECTION";
export const toggleCutAction = (datasetId, cut) => ({
  type: TOGGLE_CUT_SELECTION,
  payload: {
    datasetId,
    dimension: cut.dimension,
    value: !cut.selected
  }
});

/* Toggle drilldown selection */
export const TOGGLE_DRILLDOWN_SELECTION = "@@canon-cart/TOGGLE_DRILLDOWN_SELECTION";
export const toggleDrilldownAction = (datasetId, drill) => ({
  type: TOGGLE_DRILLDOWN_SELECTION,
  payload: {
    datasetId,
    dimension: drill.dimension,
    value: !drill.selected
  }
});

/* Toggle cart setting */
export const TOGGLE_CART_SETTING = "@@canon-cart/TOGGLE_CART_SETTING";
export const toggleSettingAction = id => ({
  type: TOGGLE_CART_SETTING,
  payload: {id}
});

/* Load all datasets in cart */
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

/** Save raw responses in state */
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

            // Set results in redux to fill shared dimensions controls
            dispatch(setSharedDimensionListAction(sharedDimensionsList));
            if (sharedDimensionsList[0]) {
              sharedDimensionLevelSelected = getLevelDimension(sharedDimensionsList[0].hierarchies[0].levels[0]);
              dispatch(sharedDimensionLevelChangedAction(sharedDimensionLevelSelected));
            }

            // Set results in redux to fill date dimensions controls
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

      // Add common dimensions
      if (sharedDimensionsLevel) {
        query.addDrilldown(sharedDimensionsLevel);
      }

      // Add common date dimension
      if (dateDimensionsLevel) {
        query.addDrilldown(dateDimensionsLevel);
      }

      // Add Measures
      datasetObj.query.params.measures.map(m => {
        query.addMeasure(m);
      });

      // Add extra drilldowns
      datasetObj.query.params.drilldowns.map(drill => {
        if (drill.selected && drill.available) {
          query.addDrilldown(drill);
        }
      });

      // Add extra cuts
      datasetObj.query.params.cuts.map(c => {
        if (c.selected && c.available) {
          query.addCut(c, c.members);
        }
      });

      multiClient.execQuery(query)
        .then(aggregation => {

          // Single dataset loaded success
          dispatch(successLoadDatasetAction(datasetId));
          loaded += 1;
          loadedData[datasetId] = aggregation;

          // All metadata is loaded and correct
          if (loaded === datasetIds.length) {
            dispatch(saveResponsesAction(loadedData));
            joinResultsAndShow(loadedData, sharedDimensionsLevel, dateDimensionsLevel, settings)(dispatch);
          }

        }).catch(error => {
          console.error(error);
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
      .filter(field => !isIDColName(field));
  }

  // If hide MOE cols
  if (!settings.showMOE.value) {
    cols = cols
      .filter(field => !isMOEColName(field));
  }

  // Create react-table ready cols config
  cols = cols.map(field => {
    const headerHTML = getHeaderHTML(field);
    return {
      Header: headerHTML,
      accessor: field,
      width: 200,
      // eslint-disable-next-line react/display-name
      Cell: row => {
        let formatted = row.value;
        let align = "left";
        if (row.value) {
          if (!isNaN(row.value)) {
            align = "right";
            if (!dateDimensionsLevel || field !== dateDimensionsLevel.level) {
              formatted = isIDColName(field) ? FORMATTERS.round(`${row.value}`) : FORMATTERS.commasDecimal(`${row.value}`);
            }
          }
        }
        return <div style={{textAlign: align}}>{formatted}</div>;
      }
    };
  });

  setTimeout(() => {
    dispatch(endProcessingAction(cols, data));
  }, 500); // 500ms of suspense...

};

/** Recursively process Big Map list  */
const getPlainBigList = (mapItem, settings, dateDimensionsLevel, measuresList) => {
  let rows = [];
  let cols = [];
  mapItem.each(value => {
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
