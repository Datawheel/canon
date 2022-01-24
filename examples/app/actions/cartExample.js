/** EXAMPLE url*/
export function setExampleCart(key) {
  return dispatch => {
    dispatch(setExampleCartAction(key));
  };
}
export const SET_EXAMPLE_CART = "SET_EXAMPLE_CART";
export const setExampleCartAction = (key) => ({
  type: SET_EXAMPLE_CART,
  payload: key
});

/** CUSTOM url*/
export function addCustomUrl(url) {
  return dispatch => {
    dispatch(addCustomUrlAction(url));
  };
}
export const ADD_CUSTOM_URL = "ADD_CUSTOM_URL";
export const addCustomUrlAction = (url) => ({
  type: ADD_CUSTOM_URL,
  payload: url
});


export function removeCustomUrl(url) {
  return dispatch => {
    dispatch(removeCustomUrlAction(url));
  };
}
export const REMOVE_CUSTOM_URL = "REMOVE_CUSTOM_URL";
export const removeCustomUrlAction = (url) => ({
  type: REMOVE_CUSTOM_URL,
  payload: url
});

export function clearCustomList(url) {
  return dispatch => {
    dispatch(clearCustomUrlListAction(url));
  };
}
export const CLEAR_CUSTOM_URL_LIST = "CLEAR_CUSTOM_URL_LIST";
export const clearCustomUrlListAction = (url) => ({
  type: CLEAR_CUSTOM_URL_LIST,
  payload: url
});

