import axios from "axios";
import {dataFold as fold} from "d3plus-viz";

function fetchData(key, url) {

  const returnFunction = params => {

    console.log(key);

    const u = `https://api.dataafrica.io/${url.replace("<id>", params.id)}`;
    return {
      type: "GET_DATA",
      promise: axios.get(u).then(res => ({key, data: fold(res.data)}))
    };

  };
  returnFunction.key = key;

  return returnFunction;

}

export default fetchData;
export {fetchData};
