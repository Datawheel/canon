import axios from "axios";
import {dataFold as fold} from "d3plus-viz";

function fetchData(key, url) {

  function retFunc(store) {
    const u = `https://api.dataafrica.io/${url.replace("<id>", store.id)}`;
    return {
      type: "GET_DATA",
      promise: axios.get(u).then(res => ({key, data: fold(res.data)}))
    };
  }
  retFunc.key = key;
  retFunc.url = url;

  return retFunc;

}

export default fetchData;
export {fetchData};
