import {expose} from "comlink";
import axios from "axios";

const sleep = milliseconds => {
  const start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
};

/** Generic Axios fetch from worker */
async function fetchWorker(cb, u, config) {
  axios.get(encodeURI(u), config)
    .then(async res => {
      sleep(3000);
      await cb(res.data);
    });
}

expose(fetchWorker);
