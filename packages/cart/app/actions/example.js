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
