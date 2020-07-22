import {expose} from "comlink";
import axios from "axios";

/** Axios fetch to load the blob image */
async function loadImageWorker(cb, url) {
  axios.get(encodeURI(url), {responseType: "blob"})
    .then(async res => {
      await cb(res.data);
    });
}

expose(loadImageWorker);
