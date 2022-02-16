import axios from "axios";
import getLocales from "../utils/canon/getLocales";
import {REQUEST_STATUS} from "../utils/consts/redux";

const catcher = e => {
  console.log(`Error in report action: ${e}`);
  return {data: {}};
};

const getParamsFromStore = store => ({
  slugs: store.cms.status.pathObj.previews?.map(d => d.slug).join(),
  query: Object.entries(store.cms.status.query).map(([k, v]) => `${k}=${v}`).join("&")
});

axios.interceptors.request.use(d => {
  d.meta = d.meta || {};
  d.meta.requestStartedAt = new Date().getTime();
  return d;
});

axios.interceptors.response.use(d => {
  d.requestDuration = new Date().getTime() - d.config.meta.requestStartedAt;
  return d;
}, e => Promise.reject(e));

/** */
export function getReports() {
  return async function(dispatch, getStore) {
    const resp = await axios.get(`${getStore().env.CANON_API}/api/reports/tree`).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
    if (resp.status === 200) {
      dispatch({type: "REPORTS_GET", data: resp.data});
      return {status: REQUEST_STATUS.SUCCESS};
    }
    else {
      return {status: REQUEST_STATUS.ERROR, error: resp.status};
    }
  };
}

/** */
export function translateReport(id, variables, source, target) {
  return function(dispatch, getStore) {
    const translationCounter = getStore().cms.status.translationCounter + 1;
    dispatch({type: "TRANSLATE_START"});
    return axios.post(`${getStore().env.CANON_API}/api/reports/report/translate`, {id, variables, source, target})
      .then(({data}) => {
        if (data.error) {
          dispatch({type: "TRANSLATE_ERROR", error: data.error, translationCounter});
        }
        else {
          dispatch({type: "REPORT_TRANSLATE", data, translationCounter});
        }
      }).catch(e => {
        dispatch({type: "TRANSLATE_ERROR", error: e.message, translationCounter});
      });
  };
}

/** */
export function translateSection(id, variables, source, target) {
  return function(dispatch, getStore) {
    const translationCounter = getStore().cms.status.translationCounter + 1;
    dispatch({type: "TRANSLATE_START"});
    return axios.post(`${getStore().env.CANON_API}/api/reports/section/translate`, {id, variables, source, target})
      .then(({data}) => {
        if (data.error) {
          dispatch({type: "TRANSLATE_ERROR", error: data.error, translationCounter});
        }
        else {
          dispatch({type: "SECTION_TRANSLATE", data, translationCounter});
        }
      }).catch(e => {
        dispatch({type: "TRANSLATE_ERROR", error: e.message, translationCounter});
      });
  };
}

/** */
export function modifyDimension(payload) {
  return function(dispatch, getStore) {
    const config = {params: {
      section: getStore().cms.status.activeSection,
      ...getParamsFromStore(getStore())
    }};
    return axios.post("/api/reports/dimension/upsert", payload, config)
      .then(resp => {
        if (resp.status === 200) {
          dispatch({type: "DIMENSION_MODIFY", data: resp.data});
          return {status: REQUEST_STATUS.SUCCESS};
        }
        else {
          return {status: REQUEST_STATUS.ERROR, error: resp.status};
        }
      });
  };
}

/** */
export function deleteDimension(id) {
  return function(dispatch, getStore) {
    const params = {
      section: getStore().cms.status.activeSection,
      ...getParamsFromStore(getStore())
    };
    return axios.delete("/api/reports/report_meta/delete", {data: {id}, params})
      .then(resp => {
        if (resp.status === 200) {
          dispatch({type: "DIMENSION_MODIFY", data: resp.data});
          return {status: REQUEST_STATUS.SUCCESS};
        }
        else {
          return {status: REQUEST_STATUS.ERROR, error: resp.status};
        }
      });
  };
}

/** */
export function activateSection(id, previews, query) {
  return function(dispatch, getStore) {
    // todo1.0 wondering on whether this should be a post - but that affects all the following posts, which use
    // the post for the payload, but the params for the "arguments"
    const config = {
      params: {
        id,
        slugs: (previews || getStore().cms.status.pathObj.previews || []).map(d => d.slug).join(),
        query: Object.entries(query || getStore().cms.status.query).map(([k, v]) => `${k}=${v}`).join("&")
      }
    };
    return axios.get("/api/reports/section/activate", config)
      .then(resp => {
        if (resp.status === 200) {
          dispatch({type: "SECTION_ACTIVATE", data: resp.data, id});
          return {status: REQUEST_STATUS.SUCCESS};
        }
        else {
          return {status: REQUEST_STATUS.ERROR, error: resp.status};
        }
      });
  };
}

/** */
export function newEntity(type, payload) {
  return async function(dispatch, getStore) {
    const store = getStore();
    const config = {params: getParamsFromStore(store)};
    const resp = await axios.post(`${store.env.CANON_API}/api/reports/${type}/new`, payload, config).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
    if (resp.status === 200) {
      dispatch({type: `${type.toUpperCase()}_NEW`, data: resp.data});
      return {status: REQUEST_STATUS.SUCCESS};
    }
    else {
      // dispatch({type: `${type.toUpperCase()}_ERROR`, data: {id: payload.id}});
      return {status: REQUEST_STATUS.ERROR, error: resp.status};
    }

  };
}

// todo1.0 clear out all this formatter/locales compiling stuff

/** */
export function updateEntity(type, payload) {
  return async function(dispatch, getStore) {
    // Formatters require locales in the payload to know what languages to compile for
    const store = getStore();
    const config = {params: getParamsFromStore(store)};
    const {locales} = getLocales(store.env);
    const resp = await axios.post(`${store.env.CANON_API}/api/reports/${type}/update`, payload, config).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
    if (resp.status === 200) {
      dispatch({type: `${type.toUpperCase()}_UPDATE`, data: resp.data, locales});
      return {status: REQUEST_STATUS.SUCCESS};
    }
    else {
      // dispatch({type: `${type.toUpperCase()}_ERROR`, data: {id: payload.id}});
      return {status: REQUEST_STATUS.ERROR, error: resp.status};
    }
  };
}

/** */
export function deleteEntity(type, payload) {
  return async function(dispatch, getStore) {
    const store = getStore();
    const params = getParamsFromStore(store);
    // Formatters require locales in the payload to know what languages to compile for
    const {locales} = getLocales(store.env);
    const resp = await axios.delete(`${store.env.CANON_API}/api/reports/${type}/delete`, {data: payload, params}).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
    if (resp.status === 200) {
      dispatch({type: `${type.toUpperCase()}_DELETE`, data: resp.data, locales});
      return {status: REQUEST_STATUS.SUCCESS};
    }
    else {
      // dispatch({type: `${type.toUpperCase()}_ERROR`, data: {id: payload.id}});
      return {status: REQUEST_STATUS.ERROR, error: resp.status};
    }
  };
}
