import axios from "axios";
import PromiseThrottle from "promise-throttle";
import {encodeChars} from "../helpers/fixChars.js";
import "@babel/polyfill";
// @ts-ignore
import FetchWorker from "./fetch.worker.js";
import WrapperWorker from "./wrapper.worker.js";

import {wrap, proxy} from "comlink";


const throttle = new PromiseThrottle({
  requestsPerSecond: 10,
  promiseImplementation: Promise
});

const isSSR = typeof window === "undefined";

const fetchWorker = isSSR ? false : wrap(new FetchWorker());
const wrapperWorker = isSSR ? false : wrap(new WrapperWorker());

/**
 * @function fetchData
 * Fetches data server side to be used in rendering.
 * @param {String} key The key used to store inside of the redux store data object (ie. "store.data.key").
 * @param {String} url The URL to request data from. All keys in the url surrounded by angle brackets (ie. "<id>") will be replaced with any matching URL params and store variables.
 * @param {Function} format Option callback function to format the return data.
 * @param {*} config Optional axios config object.
 */
export function fetchData(key, url, format = d => d, config = {}) {

  const returnFunction = (params, store) => {

    let u = url.indexOf("http") === 0 ? url : `${store.env.CANON_API}${url}`;

    (url.match(/<[^\&\=\/>]+>/g) || []).forEach(variable => {
      let x = variable.slice(1, -1).split(".");
      if (params[x[0]]) x = params[x[0]];
      else if (store.data && store.data[x[0]]) x = x.reduce((o, i) => o[i], store.data);
      else if (store[x[0]]) x = x.reduce((o, i) => o[i], store);
      else x = false;
      if (x && typeof x !== "object") u = u.replace(variable, encodeChars(x));
    });

    /** A) Regular axios function for server render */
    const axiosFn = () => axios.get(encodeURI(u), config).then(res => ({key, data: format(res.data)}));

    /** B) Web worker functions to client side calls */
    /** Web worker launch function */
    async function launchWorker(callback) {
      if (fetchWorker) {
        // @ts-ignore
        await fetchWorker(proxy(callback), u, config);
      }
    }

    /** Actual promise for web worker stategy */
    const workerFn = () => new Promise((resolve, reject) => {
      const callback = data => {
        resolve({key, data: format(data)});
      };
      try {
        launchWorker(callback);
      }
      catch (error) {
        console.error(error);
        reject(error);
      }
    });

    return {
      type: "GET_DATA",
      // @ts-ignore
      promise: throttle.add(isSSR ? axiosFn : workerFn), // Depends on if is server or client
      description: u
    };

  };
  returnFunction.key = key;

  return returnFunction;

}

/** Launch the generic wrapper */
async function launchWorkerWrapper(fn, callback) {
  if (wrapperWorker) {
    await wrapperWorker(proxy(fn), proxy(callback));
  }
  else {
    callback(fn());
  }
}

/** Generic webworker wrapper. */
export function needWebWorkerPromise(key, fn) {
  return new Promise((resolve, reject) => {
    const callback = data => {
      resolve({key, data});
    };
    try {
      launchWorkerWrapper(fn, callback);
    }
    catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

