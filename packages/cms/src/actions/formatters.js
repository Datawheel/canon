import axios from "axios";

const getLocales = env => {
  const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
  const locales = env.CANON_LANGUAGES ? env.CANON_LANGUAGES.split(",") : [localeDefault];
  if (!locales.includes(localeDefault)) locales.push(localeDefault);
  return locales;
};

/** */
export function getFormatters() { 
  return function(dispatch, getStore) {
    const locales = getLocales(getStore().env);
    return axios.get(`${getStore().env.CANON_API}/api/cms/formatter`)
      .then(({data}) => {
        dispatch({type: "FORMATTER_GET", data, locales});
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

