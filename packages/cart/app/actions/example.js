/** EXAMPLE url*/
export function setExampleVizBuilder(url) {
  return dispatch => {
    dispatch(setExampleVizBuilderUrl(url));
  };
}
export const SET_EXAMPLE_VIZ_BUILDER_URL = "SET_EXAMPLE_VIZ_BUILDER_URL";
export const setExampleVizBuilderUrl = (url) => ({
  type: SET_EXAMPLE_VIZ_BUILDER_URL,
  payload: url
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

