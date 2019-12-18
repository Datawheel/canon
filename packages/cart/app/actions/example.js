/** EXAMPLE */
export function setExample(example) {
  return dispatch => {
    dispatch(setExampleSite(example));
  };
}
export const SET_EXAMPLE_SITE = "SET_EXAMPLE_SITE";
export const setExampleSite = (example) => ({
  type: SET_EXAMPLE_SITE,
  payload: example
});

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
