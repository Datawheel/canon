import axios from "axios";
import PromiseThrottle from "promise-throttle";
import {encodeChars} from "../helpers/fixChars.js";

const throttle = new PromiseThrottle({
  requestsPerSecond: 10,
  promiseImplementation: Promise
});

/**
 * @function fetchData
 * Fetches data server side to be used in rendering.
 * @param {String} key The key used to store inside of the redux store data object (ie. "store.data.key").
 * @param {String} url The URL to request data from. All keys in the url surrounded by angle brackets (ie. "<id>") will be replaced with any matching URL params and store variables.
 * @param {Function} format Option callback function to format the return data.
 * @param {Object} config Optional axios config object.
 * @param {Boolean} useCache Whether or not URLs with no variables should be cached.
 */
function fetchData(key, url, format = d => d, config = {}, useCache = true) {

  const returnFunction = (params, store) => {

    let u = url.indexOf("http") === 0 ? url : `${store.env.CANON_API}${url}`;

    const variables = url.match(/<[^\&\=\/>]+>/g) || [];

    if (!variables.length && store.data[key] && useCache) {
      return {
        type: "GET_DATA_SUCCESS",
        res: {
          key,
          data: store.data[key]
        }
      };
    }
    else {

      variables.forEach(variable => {
        let x = variable.slice(1, -1).split(".");
        if (params[x[0]]) x = params[x[0]];
        else if (store.data && store.data[x[0]]) x = x.reduce((o, i) => o[i], store.data);
        else if (store[x[0]]) x = x.reduce((o, i) => o[i], store);
        else x = false;
        if (x && typeof x !== "object") u = u.replace(variable, encodeChars(x));
      });

      return {
        type: "GET_DATA",
        promise: throttle.add(() => axios.get(encodeURI(u), config).then(res => ({key, data: format(res.data)}))),
        description: u
      };

    }

  };
  returnFunction.key = key;

  return returnFunction;

}

export {fetchData};
