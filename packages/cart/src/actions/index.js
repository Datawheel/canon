import localforage from "localforage";
import {getHashCode, getHumanTitle} from "../helpers/transformations";
import {STORAGE_CART_KEY} from "../helpers/consts";

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
  const human = getHumanTitle(query);
  return {
    type: ADD_TO_CART,
    payload: {
      id: getHashCode(query),
      url: query,
      name: human.title,
      query: human.meta,
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
  Object.keys(datasets).map((d, ix) => {
    // TEST LOADING
    setTimeout(() => {
      dispatch(successLoadDatasetAction(d));
    }, (ix + 1) * 1000);
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
