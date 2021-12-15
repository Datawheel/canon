import axios from "axios";
import {activateSection} from "./reports";

/** */
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
      const {activeSection, query} = getStore().cms.status;
      const newQuery = {...query, ...status.query};
      dispatch({type: "STATUS_SET", data: {query: newQuery}});
      // todo1.0 ask ryan about this status bounce
      if (activeSection) {
        dispatch(activateSection(activeSection, null, newQuery));
      }
    }
    else {
      dispatch({type: "STATUS_SET", data: status});
    }
  };
}
