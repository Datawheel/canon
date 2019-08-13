import localforage from "localforage";
import {getHashCode, parseURL} from "../helpers/transformations";
import {STORAGE_CART_KEY} from "../helpers/consts";
import {Client} from "@datawheel/olap-client";
import axios from "axios";

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
export const loadDatasetsAction = datasets => dispatch => {
  dispatch(loadAllDatasetsAction());
  let loaded = 0;
  const client = new Client([]);
  console.log("DATASETS TO LOAD!!", datasets);
  console.log(client);
  const datasetIds = Object.keys(datasets);
  let datasetObj;
  const loadedData = {};
  datasetIds.map((datasetId, ix) => {
    datasetObj = datasets[datasetId];
    axios.get(datasetObj.url)
      .then(resp => {
        console.log(resp.data);
        loadedData[datasetId] = resp.data;
        dispatch(successLoadDatasetAction(datasetId));
        loaded += 1;
        if (loaded === datasetIds.length) {
          processAllDatasets(dispatch, loadedData);
        }
      });
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

/** Processing datasets */
export const processAllDatasets = (dispatch, datasets) => {
  dispatch(startProcessingAction());
  console.log("processAllDatasets->", datasets);
  // TODO: merge datasets
  setTimeout(() => {
    dispatch(endProcessingAction());
  }, 2000);
};

export const START_PROCESSING_DATASETS = "@@canon-cart/START_PROCESSING_DATASETS";
export const startProcessingAction = () => ({
  type: START_PROCESSING_DATASETS
});

export const END_PROCESSING_DATASETS = "@@canon-cart/END_PROCESSING_DATASETS";
export const endProcessingAction = () => ({
  type: END_PROCESSING_DATASETS
});
