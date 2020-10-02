import axios from "axios";
import PromiseThrottle from "promise-throttle";
import {encodeChars} from "../helpers/fixChars.js";

const throttle = new PromiseThrottle({
  requestsPerSecond: 10,
  promiseImplementation: Promise
});

const defaultConfig = {
  format: d => d,
  config: {},
  useCache: true,
  useParams: true
};

/**
 * @function fetchData
 * Fetches data server side to be used in rendering.
 * @param {String} key The key used to store inside of the redux store data object (ie. "store.data.key").
 * @param {String} url The URL to request data from. All keys in the url surrounded by angle brackets (ie. "<id>") will be replaced with any matching URL params and store variables.
 * @param {Object} userConfig
 * @param {Function} userConfig.format Option callback function to format the return data.
 * @param {Object} userConfig.config Optional axios config object.
 * @param {Boolean} userConfig.useCache Whether or not URLs with no variables should be cached.
 * @param {Boolean} userConfig.useParams Whether or not to append the current page's query params into the URL (necessary for CMS profiles).
 */
function fetchData(key, url, userConfig = defaultConfig, depConfig, depUseCache) {

  // handles deprecated use of arguments 3, 4, and 5
  if (typeof userConfig === "function") {
    userConfig = Object.assign(defaultConfig, {
      format: userConfig,
      config: depConfig !== undefined ? depConfig : defaultConfig.config,
      useCache: depUseCache !== undefined ? depUseCache : defaultConfig.useCache
    });
  }

  const {config, format, useCache, useParams} = userConfig;

  const returnFunction = (params, store, query = {}) => {

    let u = url.indexOf("http") === 0 ? url : `${store.env.CANON_API}${url}`;

    // If a query was provided, then the URL of the requesting page contained ?query=params. Pass these through
    // via the config params object of the axios get, so that the API has visibility into these params.
    const axiosConfig = useParams ? {...config, params: {...config.params, ...query}} : config;

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
        promise: throttle.add(() => axios.get(encodeURI(u), axiosConfig).then(res => ({key, data: format(res.data)}))),
        description: u
      };

    }

  };
  returnFunction.key = key;

  return returnFunction;

}

export {fetchData};
