import axios from "axios";
import {activateSection} from "./reports";

/** Helper function for editing the status' query parameters */
async function setStatusQuery(dispatch, getStore, queryParams) {
  const status = getStore().cms.status;
  const newQuery = {...status.query, ...queryParams};
  // filter out undefined properties (so keys can be deleted if necessary)
  Object.keys(newQuery).forEach(key => newQuery[key] === undefined && delete newQuery[key]);
  dispatch({type: "STATUS_SET", data: {...status, query: newQuery}});
  // todo1.0 ask ryan about this status bounce
  if (status.activeSection) {
    dispatch(activateSection(status.activeSection, null, newQuery));
  }
}

/** Set the status state to a given status */
export function setStatus(status) {
  return async function(dispatch, getStore) {
    if (status.pathObj?.previews?.length > 0) {
      const {activeSection, localeDefault} = getStore().cms.status;
      const previewString = status.pathObj.previews.join();
      const fullPreviews = await axios.get(`/api/reports/newsearch?slug=${previewString}`).then(d => d.data);
      const previews = fullPreviews.map(d => ({
        id: d.id,
        slug: d.slug,
        namespace: d.namespace,
        name: d.contentByLocale[status.localeDefault || localeDefault].name
      }));
      status.pathObj.previews = previews;
      const query = {...getStore().cms.status.query, ...status.query};
      status.query = query;
      dispatch({type: "STATUS_SET", data: status});
      // todo1.0 ask ryan about this status bounce
      if (activeSection) {
        dispatch(activateSection(activeSection, previews, query));
      }
    }
    else if (status.query) {
      setStatusQuery(dispatch, getStore, {...status.query});
    }
    else {
      dispatch({type: "STATUS_SET", data: status});
    }
  };
}

/** Deletes a given key from the current query parameters */
export function deleteQueryParam(key) {
  return async(dispatch, getStore) => setStatusQuery(dispatch, getStore, {[key]: undefined});
}

/** Adds to or edits the current status query parameters to include the given key/val */
export function setQueryParam(key, value) {
  return async(dispatch, getStore) => setStatusQuery(dispatch, getStore, {[key]: value});
}
