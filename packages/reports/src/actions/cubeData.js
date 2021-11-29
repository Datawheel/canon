import axios from "axios";

/** */
export function getCubeData() {
  return function(dispatch, getStore) {
    return axios.get(`${getStore().env.CANON_API}/api/cubeData`)
      .then(({data}) => {
        dispatch({type: "CUBEDATA_GET", data});
      });
  };
}
