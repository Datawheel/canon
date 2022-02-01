import axios from "axios";
import getLocales from "../utils/canon/getLocales";
import {REQUEST_STATUS} from "../utils/consts/redux";

/** */
export function getFormatters() {
  return async function(dispatch, getStore) {
    const locales = getLocales(getStore().env);
    const resp = await axios.get(`${getStore().env.CANON_API}/api/reports/formatter`).catch(e => ({status: REQUEST_STATUS.ERROR, error: e.message}));
    if (resp.status === 200) {
      dispatch({type: "FORMATTER_GET", data: resp.data, locales});
      return {status: REQUEST_STATUS.SUCCESS};
    }
    else {
      return {status: REQUEST_STATUS.ERROR, error: resp.status};
    }
  };
}
