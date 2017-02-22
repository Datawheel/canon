import {API} from ".env";
import axios from "axios";
import {dataFold as fold} from "d3plus-viz";

export function fetchData(key, url) {

  function retFunc(store) {
    const u = `${API}${url.replace("<id>", store.id)}`;
    return {
      type: "GET_DATA",
      promise: axios.get(u).then(res => ({key, data: fold(res.data)}))
    };
  }
  retFunc.key = key;
  retFunc.url = url;

  return retFunc;

}
