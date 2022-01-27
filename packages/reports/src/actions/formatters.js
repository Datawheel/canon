import axios from "axios";
import getLocales from "../utils/canon/getLocales";

/** */
export function getFormatters() {
  return function(dispatch, getStore) {
    const locales = getLocales(getStore().env);
    return axios.get(`${getStore().env.CANON_API}/api/reports/formatter`)
      .then(({data}) => {
        dispatch({type: "FORMATTER_GET", data, locales});
      });
  };
}
