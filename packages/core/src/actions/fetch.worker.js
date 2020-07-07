import {expose} from "comlink";
import axios from "axios";

/** Generic Axios fetch from worker */
async function fetchWorker(cb, u, config) {
  axios.get(encodeURI(u), config)
    .then(async res => {
      await cb(res.data);
    });
}

expose(fetchWorker);
