import axios from "axios";

/** */
export function getFormatters() { 
  return function(dispatch, getStore) {
    return axios.get(`${getStore().env.CANON_API}/api/cms/formatter`)
      .then(({data}) => {
        dispatch({type: "FORMATTER_GET", data});
      });
  };
}

/** */
export function newFormatter(payload) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/formatter/new`, payload)
      .then(({data}) => {
        dispatch({type: "FORMATTER_NEW", data});
      });
  };
}

/** */
export function updateFormatter(payload) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/formatter/update`, payload)
      .then(({data}) => {
        dispatch({type: "FORMATTER_UPDATE", data});
      });
  };
}

/** */
export function deleteFormatter(id) { 
  return function(dispatch, getStore) {
    axios.delete(`${getStore().env.CANON_API}/api/cms/formatter/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "FORMATTER_DELETE", data});
      });
  };
}

