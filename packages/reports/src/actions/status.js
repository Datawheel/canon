import axios from "axios";
import {activateSection} from "./reports";

/** */
export function setStatus(status) {
  return async function(dispatch, getStore) {
    if (status.pathObj?.previews) {
      const {localeDefault, activeSection} = getStore().cms.status;
      const previewString = status.pathObj.previews.join();
      const fullPreviews = await axios.get(`/api/reports/newsearch?slug=${previewString}`).then(d => d.data);
      const previews = fullPreviews.map(d => ({
        id: d.id,
        slug: d.slug,
        namespace: d.namespace,
        name: d.contentByLocale[localeDefault].name
      }));
      status.pathObj.previews = previews;
      dispatch({type: "STATUS_SET", data: status});
      // todo1.0 ask ryan about this status bounce
      if (activeSection) {
        dispatch(activateSection(activeSection, previews));
      }
    }
    else {
      dispatch({type: "STATUS_SET", data: status});
    }
  };
}
