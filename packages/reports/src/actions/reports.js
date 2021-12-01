import axios from "axios";
import getLocales from "../utils/getLocales";
import {REQUEST_STATUS} from "../utils/consts/redux";

const catcher = e => {
  console.log(`Error in report action: ${e}`);
  return {data: {}};
};

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
  return function(dispatch, getStore) {
    return axios.get(`${getStore().env.CANON_API}/api/reports/tree`)
      .then(({data}) => {
        dispatch({type: "REPORTS_GET", data});
      });
  };
}

/** */
export function newReport(payload) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/reports/report/new`, payload)
      .then(({data}) => {
        dispatch({type: "REPORT_NEW", data});
      });
  };
}

/** */
export function deleteReport(id) {
  return function(dispatch, getStore) {
    return axios.delete(`${getStore().env.CANON_API}/api/reports/report/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "REPORT_DELETE", data});
      });
  };
}

/** */
export function duplicateReport(id) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/reports/report/duplicate`, {id})
      .then(({data}) => {
        dispatch({type: "REPORT_DUPLICATE", data});
      });
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
export function duplicateSection(id, pid) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/reports/section/duplicate`, {id, pid})
      .then(({data}) => {
        dispatch({type: "SECTION_DUPLICATE", data});
      });
  };
}

/** */
export function duplicateEntity(type, payload) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/reports/${type}/duplicate`, payload)
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_DUPLICATE`, data});
      });
  };
}

/** */
export function swapEntity(type, id) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/reports/${type}/swap`, {id})
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_SWAP`, data});
      });
  };
}

/** */
export function modifyDimension(payload) {
  return function(dispatch) {
    return axios.post("/api/reports/ingest", payload)
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
    const diffCounter = getStore().cms.status.diffCounter + 1;
    return axios.delete("/api/reports/report_meta/delete", {params: {id}})
      .then(({data}) => {
        dispatch({type: "DIMENSION_MODIFY", data, diffCounter});
      });
  };
}

/** */
export function activateSection(id) {
  return function(dispatch) {
    return axios.get("/api/reports/section/activate", {params: {id}})
      .then(resp => {
        if (resp.status === 200) {
          dispatch({type: "SECTION_ACTIVATE", data: resp.data});
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
    const resp = await axios.post(`${store.env.CANON_API}/api/reports/${type}/new`, payload).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
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
    const locales = getLocales(store.env);
    const resp = await axios.post(`${store.env.CANON_API}/api/reports/${type}/update`, payload).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
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
    // Formatters require locales in the payload to know what languages to compile for
    const locales = getLocales(store.env);
    const resp = await axios.delete(`${store.env.CANON_API}/api/reports/${type}/delete`, {params: payload}).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
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

/**
 * Vizes have the ability to call setVariables({key: value}), which "breaks out" of the viz
 * and overrides/sets a variable in the variables object. This does not require a server
 * round-trip - we need only inject the variables object and trigger a re-render.
 */
export function setVariables(newVariables) {
  return function(dispatch, getStore) {
    const {variables} = getStore().cms;

    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(variables).every(locale =>
      Object.keys(newVariables).every(key => variables[locale][key] === newVariables[key])
    );
    if (!alreadySet) {
      Object.keys(variables).forEach(locale => {
        variables[locale] = Object.assign({}, variables[locale], newVariables);
      });
      dispatch({type: "VARIABLES_SET", data: {variables}});
    }
  };
}
