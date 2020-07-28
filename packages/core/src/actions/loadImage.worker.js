import {expose} from "comlink";
import axios from "axios";

/** Axios fetch to load the blob image */
function loadImageWorker(cb, url) {
  axios.get(encodeURI(url), {responseType: "blob"})
    .then(res => {
      cb(res.data);
    });
}

expose(loadImageWorker);
